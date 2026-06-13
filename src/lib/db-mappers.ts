import type { Load } from '../types';

type LoadRow = {
  id: string;
  user_id: string;
  load_number: string;
  broker_name: string;
  pickup_date: string;
  gross_amount: number;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  source: string;
};

export function rowToLoad(row: LoadRow): Load {
  return {
    id: row.id,
    loadNumber: row.load_number,
    brokerName: row.broker_name,
    pickupDate: row.pickup_date,
    grossAmount: Number(row.gross_amount),
    originCity: row.origin_city,
    originState: row.origin_state,
    destinationCity: row.destination_city,
    destinationState: row.destination_state,
  };
}

export function loadToRow(load: Load, userId: string, source: 'extract' | 'manual' = 'extract') {
  return {
    user_id: userId,
    load_number: load.loadNumber,
    broker_name: load.brokerName,
    pickup_date: load.pickupDate,
    gross_amount: load.grossAmount,
    origin_city: load.originCity,
    origin_state: load.originState,
    destination_city: load.destinationCity,
    destination_state: load.destinationState,
    source,
  };
}
