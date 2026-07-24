import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Smartphone,
  CreditCard,
  Zap,
  Check,
  Truck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { CartItem, UserProfile, BookFormat } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CartCheckoutModalProps {
  items: CartItem[];
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  currentUser: UserProfile;
}

// Le backend attend les formats en majuscules (enum Prisma BookFormat).
const FORMAT_TO_API: Record<BookFormat, string> = {
  ebook: 'EBOOK',
  audio: 'AUDIO',
  physical: 'PHYSICAL',
  bundle: 'BUNDLE',
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  items,
  onClose,
  onRemoveItem,
  onClearCart,
  currentUser,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'mtn_momo' | 'card'>('orange_money');
  const [phoneInput, setPhoneInput] = useState<string>(currentUser.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Dakar, Mermoz Sacré-Cœur');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { refreshLibrary } = useAuth();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const hasPhysicalBooks = items.some((it) => it.format === 'physical');
  const deliveryFee = hasPhysicalBooks ? 2000 : 0; // 2,000 FCFA
  const grandTotal = subtotal + deliveryFee;

  async function pollPaymentStatus(paymentId: string, attempts = 15): Promise<boolean> {
    for (let i = 0; i < attempts; i++) {
      setStatusMessage(`Vérification du paiement en cours... (${i + 1}/${attempts})`);
      const { status } = await api.get<{ status: string }>(`/payments/status/${paymentId}`);
      if (status === 'SUCCESS' || status === 'SUCCESSFUL') return true;
      if (status === 'FAILED') return false;
      await sleep(3000);
    }
    return false;
  }

  const handlePayOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setStatusMessage(null);

    try {
      // 1) Créer la commande réelle côté API à partir du panier.
      const { order } = await api.post<{ order: { id: string; totalAmountFcfa: number } }>('/orders', {
        items: items.map((it) => ({
          bookId: it.book.id,
          format: FORMAT_TO_API[it.format],
          quantity: it.quantity,
        })),
        deliveryAddress: hasPhysicalBooks ? deliveryAddress : undefined,
      });

      // 2) Démarrer le paiement selon le moyen choisi.
      if (paymentMethod === 'card') {
        const { checkoutUrl } = await api.post<{ checkoutUrl: string; paymentId: string }>(
          '/payments/stripe/checkout',
          { orderId: order.id }
        );
        // Redirection vers la page Stripe hébergée : le paiement se termine hors de cette modale.
        window.location.href = checkoutUrl;
        return;
      }

      if (paymentMethod === 'orange_money') {
        const { paymentUrl, paymentId } = await api.post<{ paymentUrl: string; paymentId: string }>(
          '/payments/orange-money/initiate',
          { orderId: order.id }
        );
        if (paymentUrl) window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        const succeeded = await pollPaymentStatus(paymentId);
        if (!succeeded) throw new Error("Le paiement Orange Money n'a pas abouti. Réessayez.");
      } else {
        const { referenceId: _referenceId, paymentId } = await api.post<{ referenceId: string; paymentId: string }>(
          '/payments/mtn-momo/initiate',
          { orderId: order.id, payerMsisdn: phoneInput || '+221770000000' }
        );
        const succeeded = await pollPaymentStatus(paymentId);
        if (!succeeded) throw new Error("Le paiement MTN MoMo n'a pas abouti. Réessayez.");
      }

      setStep('success');
      onClearCart();
      await refreshLibrary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue pendant le paiement.');
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bento-card max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-800 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif font-bold text-lg text-white">
              {step === 'cart' && 'Mon Panier Littéraire'}
              {step === 'checkout' && 'Finaliser ma Commande'}
              {step === 'success' && 'Confirmation de Commande'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Cart Items */}
        {step === 'cart' && (
          <div className="space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">Votre panier est vide.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={it.book.coverUrl} alt={it.book.title} className="w-10 h-12 rounded object-cover border border-slate-800" />
                        <div>
                          <p className="font-bold text-xs text-white line-clamp-1">
                            {it.book.title}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-semibold uppercase">
                            Format: {it.format}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono font-extrabold text-white">
                          {(it.price * it.quantity).toLocaleString('fr-FR')} FCFA
                        </span>
                        <button
                          onClick={() => onRemoveItem(it.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Sous-total :</span>
                    <span className="font-mono font-bold text-white">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  {hasPhysicalBooks && (
                    <div className="flex justify-between text-slate-300">
                      <span>Frais de livraison physique :</span>
                      <span className="font-mono font-bold text-white">2 000 FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                    <span>Total à régler :</span>
                    <span className="font-mono text-emerald-400">{grandTotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  Passer la Commande ({grandTotal.toLocaleString('fr-FR')} FCFA)
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Checkout Form */}
        {step === 'checkout' && (
          <form onSubmit={handlePayOrder} className="space-y-6">
            {hasPhysicalBooks && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center space-x-1">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Adresse de Livraison (Livre Papier)</span>
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Mode de Paiement Sécurisé
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange_money')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    paymentMethod === 'orange_money'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <span>Orange Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('mtn_momo')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    paymentMethod === 'mtn_momo'
                      ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span>MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Carte Visa</span>
                </button>
              </div>
            </div>

            {paymentMethod !== 'card' && (
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Numéro Mobile Money</label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {statusMessage && (
              <p className="text-[11px] text-slate-400 text-center">{statusMessage}</p>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'Validation en cours...' : `Payer ${grandTotal.toLocaleString('fr-FR')} FCFA`}
            </button>

            <p className="flex items-center justify-center space-x-1 text-[10px] text-slate-500">
              <ShieldCheck className="w-3 h-3" />
              <span>Paiement traité par notre API sécurisée BookVerse</span>
            </p>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-serif text-white">
              Commande Confirmée !
            </h3>
            <p className="text-xs text-slate-300">
              Votre commande a été enregistrée et le paiement confirmé. Retrouvez le suivi dans <strong>Mes Commandes</strong>.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Accéder à Ma Bibliothèque
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
