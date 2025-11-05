export interface RiosysGroupedRecord {
  SKU: string;
  Title: string;
  BrandCode: string;
  BrandName: string;
  VarietyCode: string;
  VarietyName: string;
  StoryId: string;
  StoryTitle: string;
  AutoGen: boolean; // ✅ 체크박스 기반 boolean
  Copy: {
    short: string;
    long: string;
    keywords: string[];
  };
  Prompts: {
    image: string;
    layout: string;
    tone: string;
  };
  Assets: {
    refImages: string[];
    brandPalette: string[];
    logoRef?: string;
  };
  Meta: {
    Price?: number;
    UpdatedAt?: string;
  };
}

export interface RiosysGroupedInput {
  records: RiosysGroupedRecord[];
  source: "Riosys_Input.gsheet|mergeBySKU";
  generatedAt: string;
}
