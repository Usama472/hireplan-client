import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { simpleSubscriptionAPI } from '@/http/subscription/simple-api';

interface PromoCodeInputProps {
  onPromoCodeApplied: (promoCode: any) => void;
  onPromoCodeRemoved: () => void;
  appliedPromoCode?: any;
}

export function PromoCodeInput({ 
  onPromoCodeApplied, 
  onPromoCodeRemoved, 
  appliedPromoCode 
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleValidatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    setIsValid(null);

    try {
      const response = await simpleSubscriptionAPI.validatePromoCode(promoCode);
      
      if (response.data?.valid) {
        setIsValid(true);
        onPromoCodeApplied(response.data);
        toast.success('Promo code applied successfully!');
        setPromoCode('');
      } else {
        setIsValid(false);
        toast.error(response.data?.message || 'Invalid promo code');
      }
    } catch (error: any) {
      setIsValid(false);
      const errorMessage = error.response?.data?.message || 'Failed to validate promo code';
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromoCode = () => {
    onPromoCodeRemoved();
    setIsValid(null);
    setPromoCode('');
    toast.success('Promo code removed');
  };

  if (appliedPromoCode) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Promo Code Applied</Label>
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {appliedPromoCode.promotionCode?.code}
            </span>
            {appliedPromoCode.coupon?.percent_off && (
              <span className="text-xs text-green-600">
                ({appliedPromoCode.coupon.percent_off}% off)
              </span>
            )}
            {appliedPromoCode.coupon?.amount_off && (
              <span className="text-xs text-green-600">
                (${appliedPromoCode.coupon.amount_off / 100} off)
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemovePromoCode}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">Promo Code</Label>
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className={`pl-10 ${
              isValid === false 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : isValid === true 
                ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                : ''
            }`}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleValidatePromoCode();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleValidatePromoCode}
          disabled={isValidating || !promoCode.trim()}
          className="px-4"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      
      {isValid === false && (
        <p className="text-xs text-red-600 flex items-center space-x-1">
          <X className="h-3 w-3" />
          <span>Invalid promo code</span>
        </p>
      )}
    </div>
  );
}
