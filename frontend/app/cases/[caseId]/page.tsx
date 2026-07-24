'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from "@/app/providers/LanguageProvider";
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/layout/shared/Navbar';

interface CaseDetail {
  case_id: string;
  case_number?: string;
  complaint_id?: string;
  complaint_number?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  assigned_officer_id?: string;
  district?: string;
  police_station?: string;
  fir_no?: string;
  fir_year?: string;
  fir_date?: string;
  incident_datetime?: string;
  original_chargesheet_no?: string;
  original_chargesheet_date?: string;
  supplementary_chargesheet_no?: string;
  supplementary_reason?: string;
  court_name?: string;
  court_no?: string;
  current_stage?: string;
}

export default function CaseDetailPage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const caseId = params?.caseId ?? '';

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { t } = useLanguage();

  useEffect(() => {
    if (!caseId) {
      setLoading(false);
      return;
    }

    async function loadCaseDetail() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/cases/${encodeURIComponent(caseId)}`);
        setCaseDetail(response.data || null);
      } catch (err: any) {
        console.error('Error loading case:', err);
        setError(err?.response?.data?.detail || err?.message || 'Failed to load case details');
      } finally {
        setLoading(false);
      }
    }

    loadCaseDetail();
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {t("loadingCaseDetails","cases")}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {t("caseNotFound","cases")}
          </div>
        </main>
      </div>
    );
  }

  const statusClass =
    caseDetail.status === 'Closed'
      ? 'bg-emerald-100 text-emerald-700'
      : caseDetail.status === 'Under Investigation'
      ? 'bg-amber-100 text-amber-700'
      : caseDetail.status === 'FIR Registered'
      ? 'bg-indigo-100 text-indigo-700'
      : 'bg-slate-100 text-slate-700';

  const priorityClass =
    caseDetail.priority === 'High'
      ? 'bg-red-100 text-red-700'
      : caseDetail.priority === 'Medium'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-green-100 text-green-700';

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {caseDetail.title || `Case ${caseDetail.case_number || caseDetail.case_id.slice(0, 8)}`}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("caseId","cases")}: {caseDetail.case_id}
              </p>
            </div>
            <div className="text-right">
              <Link
                href="/cases"
                className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
              >
                {t("backToCases","cases")}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
            <div className="grid gap-6">
              {/* Case Status and Priority */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">{t("status","cases")}</p>
                  <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                    {caseDetail.status || t("open","cases") }
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{t("priority","cases")}</p>
                  <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}>
                    {caseDetail.priority || t("medium","common") }
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="border-t border-slate-200 pt-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("basicInformation", "cases")}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t("caseNumber", "cases")}</p>
                    <p className="mt-1 text-sm text-slate-600">{caseDetail.case_number || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t("complaintNumber", "cases")}</p>
                    <p className="mt-1 text-sm text-slate-600">{caseDetail.complaint_number || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t("createdDate", "cases")}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {caseDetail.created_at ? new Date(caseDetail.created_at).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t("assignedOfficerId", "cases")}</p>
                    <p className="mt-1 text-sm text-slate-600">{caseDetail.assigned_officer_id || '—'}</p>
                  </div>
                </div>
              </div>

              {/* FIR Information */}
              {(caseDetail.fir_no || caseDetail.fir_year || caseDetail.fir_date) && (
                <div className="border-t border-slate-200 pt-4">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("firDetails", "cases")}</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{t("firNumber", "cases")}</p>
                      <p className="mt-1 text-sm text-slate-600">{caseDetail.fir_no || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{t("firYear", "cases")}</p>
                      <p className="mt-1 text-sm text-slate-600">{caseDetail.fir_year || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{t("firDate", "cases")}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {caseDetail.fir_date ? new Date(caseDetail.fir_date).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Information */}
              {(caseDetail.district || caseDetail.police_station) && (
                <div className="border-t border-slate-200 pt-4">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("location", "cases")}</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{t("district", "cases")}</p>
                      <p className="mt-1 text-sm text-slate-600">{caseDetail.district || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{t("policeStation", "cases")}</p>
                      <p className="mt-1 text-sm text-slate-600">{caseDetail.police_station || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Incident Information */}
              {caseDetail.incident_datetime && (
                <div className="border-t border-slate-200 pt-4">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("incidentDetails", "cases")}</h2>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t("incidentDetails", "cases")}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(caseDetail.incident_datetime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Chargesheet Information */}
              {(caseDetail.original_chargesheet_no || caseDetail.supplementary_chargesheet_no) && (
                <div className="border-t border-slate-200 pt-4">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("chargesheetDetails", "cases")}</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {caseDetail.original_chargesheet_no && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t("originalChargesheetNo", "cases")}</p>
                          <p className="mt-1 text-sm text-slate-600">{caseDetail.original_chargesheet_no}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t("originalChargesheetDate", "cases")}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {caseDetail.original_chargesheet_date
                              ? new Date(caseDetail.original_chargesheet_date).toLocaleDateString()
                              : '—'}
                          </p>
                        </div>
                      </>
                    )}
                    {caseDetail.supplementary_chargesheet_no && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t("supplementaryChargesheetNo", "cases")}</p>
                          <p className="mt-1 text-sm text-slate-600">{caseDetail.supplementary_chargesheet_no}</p>
                        </div>
                        {caseDetail.supplementary_reason && (
                          <div>
                            <p className="text-sm font-medium text-slate-700">{t("supplementaryReason", "cases")}</p>
                            <p className="mt-1 text-sm text-slate-600">{caseDetail.supplementary_reason}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Court Information */}
              {(caseDetail.court_name || caseDetail.court_no) && (
                <div className="border-t border-slate-200 pt-4">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("courtDetails", "cases")}</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{t("courtName", "cases")}</p>
                      <p className="mt-1 text-sm text-slate-600">{caseDetail.court_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{t("courtNumber", "cases")}</p>
                      <p className="mt-1 text-sm text-slate-600">{caseDetail.court_no || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Case Stage */}
              {caseDetail.current_stage && (
                <div className="border-t border-slate-200 pt-4">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("currentStage", "cases")}</h2>
                  <p className="text-sm text-slate-600">{caseDetail.current_stage}</p>
                </div>
              )}

              {/* Description */}
              {caseDetail.description && (
                <div className="border-t border-slate-200 pt-4">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("description", "cases")}</h2>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{caseDetail.description}</p>
                </div>
              )}

              {/* Related Links */}
              <div className="border-t border-slate-200 pt-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("relatedInformation", "cases")}</h2>
                <div className="flex flex-wrap gap-3">
                  {caseDetail.complaint_id && (
                    <Link
                      href={`/complaints/${caseDetail.complaint_id}`}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      {t("viewComplaint", "cases")}
                    </Link>
                  )}
                  {caseDetail.complaint_id && (
                    <Link
                      href={`/complaints/${caseDetail.complaint_id}/case_diary`}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      {t("caseDiary", "cases")}
                    </Link>
                  )}
                  {caseDetail.complaint_id && (
                    <Link
                      href={`/complaints/${caseDetail.complaint_id}/legal_sections`}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      {t("legalSections", "cases")}
                    </Link>
                  )}
                  {caseDetail.complaint_id && (
                    <Link
                      href={`/complaints/${caseDetail.complaint_id}/timeline`}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      {t("timeline", "cases")}
                    </Link>
                  )}
                  {caseId && (
                    <Link
                      href={`/cases/${caseId}/documents`}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      {t("documents", "cases")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}