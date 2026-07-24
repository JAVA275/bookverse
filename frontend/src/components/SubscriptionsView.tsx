import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  Smartphone,
  CreditCard,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { SubscriptionPlan, SubscriptionTier, UserProfile } from '../types';

interface SubscriptionsViewProps {
  currentUser: UserProfile;
  onUpdateSubscription: (tier: SubscriptionTier) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  currentUser,
  onUpdateSubscription,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'mtn_momo' | 'card'>('orange_money');
  const [phoneNumber, setPhoneNumber] = useState<string>(currentUser.phone || '');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      onUpdateSubscription(selectedPlan.id);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Accès Illimité à la Littérature Panafricaine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">
          Formules d'Abonnement BookVerse
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          Lisez et écoutez des milliers de livres sans contrainte. Payez facilement via Mobile Money ou carte bancaire.
        </p>

        {/* Monthly / Yearly Switch */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Facturation Mensuelle
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Facturation Annuelle</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px]">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Subscription Tier Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = currentUser.subscriptionTier === plan.id;
          const price =
            billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              key={plan.id}
              className={`relative bento-card p-8 transition-all flex flex-col justify-between ${
                plan.popular
                  ? 'border-emerald-500/60 bento-glow-emerald'
                  : 'hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider shadow-md">
                  Offre Recommandée
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-black text-white font-mono">
                      {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-slate-400 ml-1">
                        /{billingCycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-3 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs uppercase tracking-wider"
                  >
                    Offre Actuelle
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setPaymentSuccess(false);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition cursor-pointer shadow-md ${
                      plan.popular
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                        : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                    }`}
                  >
                    Choisir cette offre
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Simulator Bento Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bento-card max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-800">
            {!paymentSuccess ? (
              <form onSubmit={handleSubscribe} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      Souscrire à : {selectedPlan.name}
                    </h3>
                    <p className="text-xs text-emerald-400 font-bold">
                      Montant :{' '}
                      {(billingCycle === 'monthly'
                        ? selectedPlan.priceMonthly
                        : selectedPlan.priceYearly
                      ).toLocaleString('fr-FR')}{' '}
                      FCFA
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Moyen de Paiement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('orange_money')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                        paymentMethod === 'orange_money'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-amber-400" />
                      <span>Orange Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mtn_momo')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                        paymentMethod === 'mtn_momo'
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span>MTN MoMo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      <span>Carte / Visa</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Money Phone Input */}
                {paymentMethod !== 'card' ? (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-semibold">
                      Numéro Mobile Money
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77 000 00 00"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Vous recevrez un prompt USSD de confirmation sur votre téléphone.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Numéro de carte (4000 0000 0000 0000)"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Validation en cours...' : 'Confirmer et Payer'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-white">
                  Abonnement Activé avec Succès !
                </h3>
                <p className="text-xs text-slate-300">
                  Votre compte a été surclassé au forfait{' '}
                  <strong className="text-emerald-400">{selectedPlan.name}</strong>.
                  Profitez dès maintenant de vos accès illimités.
                </p>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
