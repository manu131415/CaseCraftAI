"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function ExtractButton(){
    const { t } = useLanguage();

function handleExtract(){

alert(t("callingAiBackend", "complaints"));

}

return(

<div className="mt-8 flex justify-end">

<button

onClick={handleExtract}

className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex gap-2"

>

<Sparkles/>

{t("extractFromDocuments", "complaints")}

</button>

</div>

)

}