// Types mirror response backend Flow 1 (crates/server/src/routes/flow1.rs).
// Field names snake_case = persis JSON API, tanpa mapping layer.

export type FollowUpResult = 'not_ready' | 'interested' | 'meeting' | 'ready_to_book';

export type PreBookStatusFilter = 'all' | 'overdue' | FollowUpResult;

export interface EstimatedBooking {
  year: number | null;
  month: number | null;
  date: number | null;
}

export interface NextFollowUp {
  id: string;
  scheduled_at: string | null;
  overdue: boolean;
}

export interface PreBookOpportunity {
  id: string;
  customer_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  latest_follow_up_result: FollowUpResult | null;
  estimated_booking: EstimatedBooking;
  customer_intent: string | null;
  next_follow_up: NextFollowUp | null;
  last_contact_at: string | null;
  overdue: boolean;
  follow_up_count: number;
}

export interface FollowUpActivity {
  id: string;
  pre_book_id: string;
  scheduled_at: string | null;
  activity_at: string | null;
  customer_information: string | null;
  customer_intent: string | null;
  estimated_booking_year: number | null;
  estimated_booking_month: number | null;
  estimated_booking_date: number | null;
  follow_up_result: FollowUpResult | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  overdue: boolean;
}

export interface PreBookDetail extends PreBookOpportunity {
  follow_ups: FollowUpActivity[];
}

export interface PreBookListResponse {
  items: PreBookOpportunity[];
  total: number;
  limit: number;
  offset: number;
}

export interface FollowUpHistoryResponse {
  pre_book_id: string;
  follow_ups: FollowUpActivity[];
}

export interface CreatePreBookPayload {
  customer_id: string;
}

export interface FollowUpPayload {
  scheduled_at?: string;
  activity_at?: string;
  customer_information?: string;
  customer_intent?: string;
  estimated_booking_year?: number;
  estimated_booking_month?: number;
  estimated_booking_date?: number;
  follow_up_result?: FollowUpResult;
}

export interface PreBookState {
  items: PreBookOpportunity[];
  total: number;
  statusFilter: PreBookStatusFilter;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  errorSource: string | null;
  isNetworkError: boolean;
  details: Record<string, PreBookDetail>;
  retryAction: (() => void) | null;
}
