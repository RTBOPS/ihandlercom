'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { HandlerRecord, FboRecord } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type UserProfile = {
  email: string;
  companyName: string;
  companyType: 'fbo' | 'handler';
  icao: string;
  role: string;
  status: string;
};

export default function PortalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [record, setRecord] = useState<HandlerRecord | FboRecord | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const userSnap = await getDoc(doc(db, 'users', user!.uid));
        if (!userSnap.exists()) return;
        const p = userSnap.data() as UserProfile;
        setProfile(p);

        const collectionName = p.companyType === 'fbo' ? 'fbo' : 'handler';
        const icaoField = p.companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
        const nameField = p.companyType === 'fbo' ? 'fboName' : 'handlerName';

        const snap = await getDocs(
          query(
            collection(db, collectionName),
            where(icaoField, '==', p.icao),
            where(nameField, '==', p.companyName)
          )
        );

        if (!snap.empty) {
          const r = { id: snap.docs[0].id, ...snap.docs[0].data() } as HandlerRecord | FboRecord;
          setRecord(r);
          // Pre-fill editable contact fields
          if (p.companyType === 'handler') {
            const h = r as HandlerRecord;
            setFormData({
              handlerPhone: h.handlerPhone || '',
              handlerEmail: h.handlerEmail || '',
              handlerWebsite: h.handlerWebsite || '',
              handlerAddress: h.handlerAddress || '',
              handlerPoc: h.handlerPoc || '',
              handlerPocTitle: h.handlerPocTitle || '',
              handlerPocMobile: h.handlerPocMobile || '',
              handlerRemarks: h.handlerRemarks || '',
              handlerWhatsapp: h.handlerWhatsapp || '',
            });
          } else {
            const f = r as FboRecord;
            setFormData({
              fboPhne: f.fboPhne || '',
              fboEmail: f.fboEmail || '',
              fboWebsite: f.fboWebsite || '',
              fboAddress: f.fboAddress || '',
              fboPocName: f.fboPocName || '',
              fboPocTitle: f.fboPocTitle || '',
              fboPocMobile: f.fboPocMobile || '',
              fboRemarks: f.fboRemarks || '',
              fboWhatsapp: f.fboWhatsapp || '',
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const collectionName = profile?.companyType === 'fbo' ? 'fbo' : 'handler';
      await updateDoc(doc(db, collectionName, record.id), formData);
      setSaveMsg('Changes saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMsg('Error saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-white/40">Loading your portal...</div>
        </main>
      </>
    );
  }

  if (!user) return null;

  const isFbo = profile?.companyType === 'fbo';

  const fields = isFbo
    ? [
        { key: 'fboPhne', label: 'Phone' },
        { key: 'fboEmail', label: 'Email' },
        { key: 'fboWebsite', label: 'Website' },
        { key: 'fboAddress', label: 'Address' },
        { key: 'fboPocName', label: 'Contact Person' },
        { key: 'fboPocTitle', label: 'Title' },
        { key: 'fboPocMobile', label: 'Contact Mobile' },
        { key: 'fboWhatsapp', label: 'WhatsApp' },
        { key: 'fboRemarks', label: 'Remarks', multiline: true },
      ]
    : [
        { key: 'handlerPhone', label: 'Phone' },
        { key: 'handlerEmail', label: 'Email' },
        { key: 'handlerWebsite', label: 'Website' },
        { key: 'handlerAddress', label: 'Address' },
        { key: 'handlerPoc', label: 'Contact Person' },
        { key: 'handlerPocTitle', label: 'Title' },
        { key: 'handlerPocMobile', label: 'Contact Mobile' },
        { key: 'handlerWhatsapp', label: 'WhatsApp' },
        { key: 'handlerRemarks', label: 'Remarks', multiline: true },
      ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">Owner Portal</h1>
            <p className="text-white/40 text-sm">{profile?.companyName} · {profile?.icao} · {isFbo ? 'FBO' : 'Ground Handler'}</p>
          </div>

          {profile?.status === 'pending' && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
              Your account is pending review. Once approved, your changes will be reflected in the directory.
            </div>
          )}

          {!record ? (
            <div className="rounded-2xl border border-white/10 p-8 text-center">
              <p className="text-white/50 text-sm mb-4">
                No listing found matching your company name and ICAO code.
              </p>
              <p className="text-white/30 text-xs">
                Contact <a href="mailto:operation@i-handler.app" className="text-[#F34707]">operation@i-handler.app</a> to get your company added to the directory.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white mb-2">Update Your Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) =>
                  f.multiline ? (
                    <div key={f.key} className="sm:col-span-2">
                      <label className="block text-sm text-white/60 mb-1.5">{f.label}</label>
                      <textarea
                        rows={3}
                        value={formData[f.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm resize-none"
                      />
                    </div>
                  ) : (
                    <div key={f.key}>
                      <label className="block text-sm text-white/60 mb-1.5">{f.label}</label>
                      <input
                        type="text"
                        value={formData[f.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
                      />
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saveMsg && (
                  <span className={`text-sm ${saveMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                    {saveMsg}
                  </span>
                )}
              </div>

              <p className="text-xs text-white/25 pt-2">
                To update services, logos, or other fields not shown here, contact{' '}
                <a href="mailto:operation@i-handler.app" className="text-[#F34707]">operation@i-handler.app</a>
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
