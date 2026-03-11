export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface JobRequest {
  keyword: string;
  word_count?: number;
  language?: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
}

export interface KeywordAnalysis {
  primary_keyword: string;
  secondary_keywords: string[];
}

export interface ArticleSection {
  heading: string;
  level: 1 | 2 | 3;
  content: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Article {
  sections: ArticleSection[];
  full_markdown: string;
  word_count: number;
  faqs: FAQ[];
}

export interface SEOMetadata {
  title_tag: string;
  meta_description: string;
}

export interface QualityReport {
  overall_score: number;
  checks: Record<string, boolean>;
  feedback: string;
}

export interface LinkingSuggestion {
  anchor_text: string;
  suggested_target: string;
  context_note: string;
}

export interface ExternalReference {
  source_name: string;
  url: string;
  placement_context: string;
}

export interface Job {
  id: string;
  status: JobStatus;
  keyword: string;
  target_word_count: number;
  language: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ArticleOutput {
  job_id: string;
  keyword_analysis: KeywordAnalysis;
  article: Article;
  seo_metadata: SEOMetadata;
  internal_links: LinkingSuggestion[];
  external_references: ExternalReference[];
  quality_report: QualityReport | null;
  revision_attempts: number;
}
