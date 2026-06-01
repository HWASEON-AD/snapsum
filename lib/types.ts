export type ContentType = 'shopping' | 'news' | 'video' | 'article'

export interface AnalysisResult {
  source_app: string
  content_type: ContentType
  title: string
  url: string | null
  tags: string[]
  analysis: ShoppingAnalysis | NewsAnalysis | VideoAnalysis | ArticleAnalysis
  summary_line: string
}

export interface ShoppingAnalysis {
  retailer: string
  price: string
  category: string
  highlights: string[]
}

export interface NewsAnalysis {
  key_points: string[]
}

export interface VideoAnalysis {
  duration: string
  views: string
  likes: string
  highlights: string[]
}

export interface ArticleAnalysis {
  key_points: string[]
}

export interface Item {
  id: string
  user_id: string
  created_at: string
  source_app: string
  content_type: ContentType
  title: string
  url: string | null
  thumbnail_url: string | null
  analysis: ShoppingAnalysis | NewsAnalysis | VideoAnalysis | ArticleAnalysis
  tags: string[]
  summary_line: string
  raw_screenshot_url: string | null
}
