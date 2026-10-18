import React, { useState, useEffect } from "react";
import { Upload, X, CheckCircle2, User } from "lucide-react";
import { firestoreService } from "../lib/firestoreService";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AssinaturaDigitalUploaderProps {
  user: any;
  onSignatureSaved?: (url: string) => void;
}

export default function AssinaturaDigitalUploader({ user, onSignatureSaved }: AssinaturaDigitalUploaderProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSignature = async () => {
      if (!user?.id) return;
      const docRef = doc(db, "signatures", user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSignature(docSnap.data().signatureUrl);
      }
    };
    fetchSignature();
  }, [user?.id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, 300, 100);
        const dataUrl = canvas.toDataURL("image/png");

        if (user?.id) {
          await setDoc(doc(db, "signatures", user.id), { signatureUrl: dataUrl }, { merge: true });
          setSignature(dataUrl);
          onSignatureSaved?.(dataUrl);
        }
        setIsLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-8 p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-white shadow-sm">
      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
        <User size={16} /> Assinatura Digital do Elaborador
      </h4>
      {signature ? (
        <div className="flex flex-col items-center gap-4">
          <img src={signature} alt="Assinatura" className="max-h-24 border-b border-slate-300" />
          <button onClick={() => setSignature(null)} className="text-[10px] font-bold text-red-600 hover:text-red-800 underline">Remover Assinatura</button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center cursor-pointer gap-2 py-8 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
          <Upload size={24} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Carregar Imagem da Assinatura</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
        </label>
      )}
    </div>
  );
}
