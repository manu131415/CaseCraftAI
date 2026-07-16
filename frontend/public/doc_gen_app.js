// Determine the backend URL dynamically based on the current host, matching localhost or 127.0.0.1 on port 8000
const getBackendUrl = () => {
    if (typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return `${protocol}//${hostname}:8000`;
        }
    }
    return "http://localhost:8000";
};

const BACKEND_URL = getBackendUrl();

document.addEventListener("DOMContentLoaded", () => {
    loadCases();
    
    // Add event listener for Case selection change
    document.getElementById("caseSelect").addEventListener("change", (e) => {
        const caseId = e.target.value;
        if (caseId) {
            loadCaseDetails(caseId);
            loadGeneratedDocuments(caseId);
        }
    });
});

// Show/Hide loader overlay
function showLoader(show, text = "Processing...") {
    const loader = document.getElementById("globalLoader");
    const loaderText = loader.querySelector("p");
    if (loaderText) {
        loaderText.textContent = text;
    }
    if (show) {
        loader.classList.remove("hidden");
    } else {
        loader.classList.add("hidden");
    }
}

// Fetch available cases from the DB
async function loadCases() {
    showLoader(true, "Connecting to Neon DB...");
    try {
        const response = await fetch(`${BACKEND_URL}/api/documents/cases`);
        if (!response.ok) {
            throw new Error(`Failed to fetch cases: ${response.statusText}`);
        }
        const cases = await response.json();
        
        const select = document.getElementById("caseSelect");
        select.innerHTML = ""; // Clear loader option
        
        if (cases.length === 0) {
            select.innerHTML = '<option value="">No cases found in DB</option>';
            showLoader(false);
            return;
        }
        
        // Populate select list
        cases.forEach((c, idx) => {
            const option = document.createElement("option");
            option.value = c.case_id;
            option.textContent = `${c.case_number} - ${c.title}`;
            if (idx === 0) option.selected = true; // Select first case by default
            select.appendChild(option);
        });
        
        // Trigger loading first case details
        loadCaseDetails(select.value);
        loadGeneratedDocuments(select.value);
        
    } catch (error) {
        console.error("Error loading cases:", error);
        alert(`Could not load cases from backend. Make sure the FastAPI server is running on ${BACKEND_URL}.\n\nDetails: ${error.message}`);
        showLoader(false);
    }
}

// Fetch case details, officer, and accused profiles
async function loadCaseDetails(caseId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/documents/cases/${caseId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch case details: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Map details to DOM
        document.getElementById("caseNumberVal").textContent = `FIR: ${data.case.fir_no}/${data.case.fir_year}`;
        document.getElementById("caseTitle").textContent = data.case.title || "Untitled Case";
        document.getElementById("caseStation").textContent = data.case.police_station || "Cyber Crime Police Station Ahmedabad";
        
        if (data.officer) {
            document.getElementById("caseOfficer").textContent = `${data.officer.rank} ${data.officer.name} (Badge: ${data.officer.badge_number})`;
        } else {
            document.getElementById("caseOfficer").textContent = "Inspector Rajesh Patel (Badge: GJ-4521)";
        }
        
        document.getElementById("caseStatus").innerHTML = `<span class="status-dot"></span> ${data.case.status || "Under Investigation"}`;
        
        // Handle accused profile
        const accusedArea = document.getElementById("accusedArea");
        const accusedIdInput = document.getElementById("accusedIdInput");
        
        if (data.accused && data.accused.length > 0) {
            const firstAccused = data.accused[0];
            accusedIdInput.value = firstAccused.accused_id;
            document.getElementById("accusedName").textContent = firstAccused.full_name;
            document.getElementById("accusedAlias").textContent = firstAccused.alias ? `Alias: ${firstAccused.alias}` : "Alias: None";
            document.getElementById("accusedCustody").textContent = `Custody Status: ${firstAccused.custody_status || "In Judicial Custody"}`;
            accusedArea.classList.remove("hidden");
        } else {
            accusedIdInput.value = "";
            accusedArea.classList.add("hidden");
        }
        
    } catch (error) {
        console.error("Error loading case details:", error);
    }
}

// Load list of already generated documents for this case and update card action buttons
async function loadGeneratedDocuments(caseId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/documents/case/${caseId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch case documents: ${response.statusText}`);
        }
        const docs = await response.json();
        
        // Map document_type to doc details
        const docMap = {};
        docs.forEach(doc => {
            docMap[doc.document_type] = doc;
        });
        
        // Update each document card based on its generation status
        const cards = document.querySelectorAll(".document-card");
        cards.forEach(card => {
            const docType = card.getAttribute("data-doc-type");
            const actionsDiv = card.querySelector(".card-actions");
            
            if (!actionsDiv) return;
            
            if (docMap[docType]) {
                const doc = docMap[docType];
                actionsDiv.innerHTML = `
                    <div class="btn-group" style="display: flex; gap: 0.5rem; width: 100%;">
                        <button class="btn btn-secondary btn-regenerate" style="flex: 1; min-width: 0;" onclick="triggerGenerate('${docType}')">
                            Regenerate
                        </button>
                        <button class="btn btn-primary btn-download-card" style="flex: 1.3; min-width: 0;" onclick="downloadDocument('${doc.document_id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px; vertical-align:middle; margin-right: 2px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download
                        </button>
                    </div>
                `;
            } else {
                actionsDiv.innerHTML = `
                    <button class="btn btn-primary btn-generate" onclick="triggerGenerate('${docType}')">
                        Generate Document
                    </button>
                `;
            }
        });
        
        showLoader(false);
        
    } catch (error) {
        console.error("Error loading documents list:", error);
        showLoader(false);
    }
}

// Trigger generation of a particular document
async function triggerGenerate(documentType) {
    const caseId = document.getElementById("caseSelect").value;
    const accusedId = document.getElementById("accusedIdInput").value;
    
    if (!caseId) {
        alert("Please select a case first.");
        return;
    }
    
    const friendlyName = documentType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    showLoader(true, `Generating ${friendlyName}...`);
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/documents/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                case_id: caseId,
                document_type: documentType,
                accused_id: accusedId || null
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || `Server returned code ${response.status}`);
        }
        
        const result = await response.json();
        
        // Refresh documents list and update button layout
        await loadGeneratedDocuments(caseId);
        
        // Automatically download the file immediately
        downloadDocument(result.document_id);
        
    } catch (error) {
        console.error("Error generating document:", error);
        alert(`Generation failed:\n\n${error.message}`);
        showLoader(false);
    }
}

// Trigger download of a generated document
function downloadDocument(documentId) {
    window.open(`${BACKEND_URL}/api/documents/download/${documentId}`, "_blank");
}

