export interface Load {
  id: string;
  loadNumber: string;
  brokerName: string;
  pickupDate: string;
  grossAmount: number;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
}

export interface CompanySettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  paymentInstructions: string;
  zelle: string;
  payoneer: string;
  bankInformation: string;
  dispatchPercentage: number;
}

export interface CarrierSettings {
  carrierName: string;
  carrierAddress: string;
  mcNumber: string;
  carrierPhone: string;
}

export interface WeeklyInvoice {
  id: string;
  weekLabel: string;
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  invoiceNumber: string;
  invoiceDate: string;
}
