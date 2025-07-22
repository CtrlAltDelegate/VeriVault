interface LLMAnalysisResult {
    llmName: string;
    confidence: number;
    analysisText: string;
    flaggedConcerns: string[];
    suggestedImprovements: string[];
    securityAssessment: 'low' | 'medium' | 'high' | 'critical';
    completenessScore: number;
    clarityScore: number;
    timestamp: string;
}
interface ConsensusReview {
    consensusText: string;
    consensusConfidence: number;
    discrepancies: Array<{
        issue: string;
        gpt4Opinion: string;
        claudeOpinion: string;
        consensusResolution: string;
    }>;
    flaggedForHumanReview: boolean;
    humanReviewReasons: string[];
    finalSecurityLevel: 'low' | 'medium' | 'high' | 'critical';
    improvementsApplied: string[];
}
interface MultiLLMReviewResult {
    submissionId: string;
    reportType: string;
    originalContent: string;
    gpt4Analysis: LLMAnalysisResult;
    claudeAnalysis: LLMAnalysisResult;
    consensusReview: ConsensusReview;
    finalContent: string;
    overallConfidence: number;
    requiresHumanReview: boolean;
    reviewStartTime: string;
    reviewEndTime: string;
    consensusHash: string;
}
export declare class LLMReviewService {
    constructor();
    /**
     * TODO: Main pipeline entry point - orchestrates the full multi-LLM review
     *
     * @param reportData - Original report content and metadata
     * @param reportType - Type of security report being analyzed
     * @returns Promise<MultiLLMReviewResult> - Complete review results
     */
    performMultiLLMReview(reportData: any, reportType: string): Promise<MultiLLMReviewResult>;
    /**
     * TODO: GPT-4o analysis - Focus on accuracy, completeness, and compliance
     */
    private analyzeWithGPT4;
    /**
     * TODO: Claude 3 analysis - Focus on security implications and clarity
     */
    private analyzeWithClaude;
    /**
     * TODO: Consensus review by Command R+ - Compare analyses and produce final version
     */
    private performConsensusReview;
    /**
     * TODO: Check if LLM review is required based on report type and content
     */
    shouldPerformLLMReview(reportType: string, reportData: any): Promise<boolean>;
    /**
     * TODO: Generate confidence threshold warnings
     */
    private checkConfidenceThresholds;
    /**
     * TODO: Flag report for admin review
     */
    flagForAdminReview(submissionId: string, concerns: string[], llmResults: MultiLLMReviewResult): Promise<void>;
    /**
     * TODO: Get LLM review status for a submission
     */
    getLLMReviewStatus(submissionId: string): Promise<any>;
}
export declare const llmReviewService: LLMReviewService;
export declare const LLM_REVIEW_CONFIG: {
    ENABLED: boolean;
    CONFIDENCE_THRESHOLDS: {
        MIN_OVERALL: number;
        MIN_INDIVIDUAL: number;
        DISCREPANCY_LIMIT: number;
    };
    REVIEW_REQUIREMENTS: {
        INCIDENT_REPORTS: boolean;
        DAILY_LOGS: boolean;
        MEDICAL_REPORTS: boolean;
        AUDIT_REPORTS: boolean;
    };
    TIMEOUT_SETTINGS: {
        GPT4_TIMEOUT: number;
        CLAUDE_TIMEOUT: number;
        COMMAND_R_TIMEOUT: number;
        TOTAL_TIMEOUT: number;
    };
};
export {};
//# sourceMappingURL=llmReviewService.d.ts.map