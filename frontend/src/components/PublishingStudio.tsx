import React, { useState } from 'react';
import {
  PenTool,
  Printer,
  Sparkles,
  Calculator,
  CheckCircle2,
  FileCheck,
  Layout,
  Palette,
  ShieldCheck,
  Send,
  Sliders,
  Package,
  Clock,
  Coins
} from 'lucide-react';
import { PUBLISHING_SERVICES } from '../data/mockData';
import { PODQuoteRequest, PublishingRequest, UserProfile } from '../types';

interface PublishingStudioProps {
  currentUser: UserProfile;
}

export const PublishingStudio: React.FC<PublishingStudioProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'pod' | 'services' | 'my_requests'>('pod');

  // POD Devis Calculator State
  const [podQuote, setPodQuote] = useState<PODQuoteRequest>({
    pages: 200,
    quantity: 50,
    paperType: 'creme_80g',
    coverFinish: 'mat',
    binding: 'broche',
    formatSize: 'A5',
  });

  // Editorial Services Selected State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    'srv_relecture',
    'srv_mise_en_page',
  ]);

  // Request Form State
  const [bookTitleInput, setBookTitleInput] = useState<string>('');
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);

  // POD Price Calculator Logic
  const calculatePODTotal = () => {
    let basePerPage = 12; // FCFA
    if (podQuote.paperType === 'creme_80g') basePerPage = 15;
    if (podQuote.paperType === 'glace_115g') basePerPage = 22;

    let baseCover = 400; // FCFA
    if (podQuote.coverFinish === 'brillant') baseCover += 50;
    if (podQuote.binding === 'relie') baseCover += 1200;

    const unitPrice = podQuote.pages * basePerPage + baseCover;
    
    // Volume discount
    let discountMultiplier = 1.0;
    if (podQuote.quantity >= 100) discountMultiplier = 0.85;
    else if (podQuote.quantity >= 500) discountMultiplier = 0.70;
    else if (podQuote.quantity >= 1000) discountMultiplier = 0.60;

    const total = Math.round(unitPrice * podQuote.quantity * discountMultiplier);
    const unitDiscounted = Math.round(total / podQuote.quantity);

    return { total, unitDiscounted, discountPercentage: Math.round((1 - discountMultiplier) * 100) };
  };

  const podEstimate = calculatePODTotal();

  const handleServicesTotal = () => {
    return selectedServiceIds.reduce((sum, id) => {
      const srv = PUBLISHING_SERVICES.find((s) => s.id === id);
      return sum + (srv ? srv.price : 0);
    }, 0);
  };

  const handlePublishingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitleInput.trim()) return;

    setRequestSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner Bento Card */}
      <div className="bento-card p-8 sm:p-12 text-white space-y-4 border-emerald-500/30">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          <PenTool className="w-4 h-4 text-emerald-400" />
          <span>Maison d'Édition & Impression à la Demande</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">
          Studio d'Édition & Impression Panafricain
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
          Publiez votre œuvre en e-Book, livre audio ou livre papier. Calculez vos devis d'impression à la demande en temps réel.
        </p>

        {/* Sub-tabs */}
        <div className="flex space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSubTab('pod')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'pod'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Devis Impression POD</span>
          </button>

          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'services'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pack Éditorial & ISBN</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: POD Calculator Bento Layout */}
      {activeSubTab === 'pod' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Form Bento Card */}
          <div className="lg:col-span-2 bento-card p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold font-serif text-white flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>Simulateur d'Impression à la Demande</span>
            </h2>

            {/* Page Count Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Nombre de pages :</span>
                <span className="text-emerald-400 font-mono text-sm">
                  {podQuote.pages} pages
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={600}
                step={10}
                value={podQuote.pages}
                onChange={(e) => setPodQuote({ ...podQuote, pages: Number(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Quantity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Quantité d'exemplaires :</span>
                <span className="text-emerald-400 font-mono text-sm">
                  {podQuote.quantity} ex.
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={2000}
                step={5}
                value={podQuote.quantity}
                onChange={(e) => setPodQuote({ ...podQuote, quantity: Number(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Paper Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Type de Papier Intérieur
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'creme_80g', label: 'Crème Bouffant 80g' },
                  { id: 'blanc_80g', label: 'Blanc Offset 80g' },
                  { id: 'glace_115g', label: 'Glacé Mat 115g' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPodQuote({ ...podQuote, paperType: p.id as any })}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      podQuote.paperType === p.id
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Finish */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Finition Couverture
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'mat', label: 'Pelliculage Mat' },
                  { id: 'brillant', label: 'Pelliculage Brillant' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPodQuote({ ...podQuote, coverFinish: c.id as any })}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      podQuote.coverFinish === c.id
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Binding Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Reliure & Façonnage
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'broche', label: 'Broché Souple (Dos carré coller)' },
                  { id: 'relie', label: 'Relié Rigide (Livre d’art)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setPodQuote({ ...podQuote, binding: b.id as any })}
                    className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      podQuote.binding === b.id
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Devis Summary Bento Card */}
          <div className="bento-card bento-card-emerald p-6 sm:p-8 space-y-6 flex flex-col justify-between border border-emerald-500/30">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Coins className="w-4 h-4" />
                <span>Estimation Immédiate</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">Total HT Devis Impression :</p>
                <p className="text-3xl font-black font-mono text-emerald-400">
                  {podEstimate.total.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-xs text-slate-400">
                  Soit environ ~{Math.round(podEstimate.total / 655.957)} €
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Prix unitaire par livre :</span>
                  <span className="font-mono font-bold text-white">{podEstimate.unitDiscounted.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Remise sur volume :</span>
                  <span className="font-mono font-bold text-emerald-400">-{podEstimate.discountPercentage}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Délai de fabrication :</span>
                  <span className="font-mono font-bold text-white">5 à 7 jours ouvrés</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('Devis enregistré ! Notre équipe de production vous recontactera sous 24h.')}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Commander mon Tirage Papier
            </button>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Editorial Services Bento Layout */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PUBLISHING_SERVICES.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);

              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== srv.id));
                    } else {
                      setSelectedServiceIds([...selectedServiceIds, srv.id]);
                    }
                  }}
                  className={`bento-card p-6 transition cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-emerald-500/80 bento-glow-emerald bg-slate-900/90'
                      : 'hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <CheckCircle2
                        className={`w-6 h-6 ${
                          isSelected ? 'text-emerald-400 fill-current' : 'text-slate-700'
                        }`}
                      />
                    </div>

                    <h3 className="font-serif font-bold text-base text-white">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      ~{srv.estimatedDays} jours
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      {srv.price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Form Bento Card */}
          <div className="bento-card p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold font-serif text-white">
              Demande de Publication & Services Éditoriaux
            </h3>

            {!requestSubmitted ? (
              <form onSubmit={handlePublishingSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Titre de votre manuscrit</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : L'Ombre des Baobabs"
                    value={bookTitleInput}
                    onChange={(e) => setBookTitleInput(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-bold text-white">
                  <span>Total Services Sélectionnés :</span>
                  <span className="text-emerald-400 font-mono text-base">
                    {handleServicesTotal().toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  Envoyer mon Manuscrit à l'Équipe Éditoriale
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">
                  Demande Transmise aux Éditeurs BookVerse !
                </h4>
                <p className="text-xs text-slate-400">
                  Notre comité de lecture examinera votre projet pour "{bookTitleInput}" sous 48 heures ouvrées.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
