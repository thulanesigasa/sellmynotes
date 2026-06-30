import crypto from 'crypto';

export interface PayFastData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  custom_str1?: string;
  [key: string]: string | undefined;
}

export function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  // Sort the keys alphabetically as required by PayFast
  const keys = Object.keys(data).filter(key => key !== 'signature' && data[key] !== '').sort();
  
  let pfOutput = '';
  for (const key of keys) {
    const val = data[key];
    if (val !== undefined && val !== null) {
      pfOutput += `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, '+')}&`;
    }
  }

  // Remove the trailing '&'
  let getString = pfOutput.slice(0, -1);

  if (passphrase) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(getString).digest('hex');
}
