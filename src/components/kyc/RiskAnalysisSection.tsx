import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ShieldCheckIcon, ShieldExclamationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface RiskAnalysisSectionProps {
  kycCaseId: string;
  onComplete: () => void;
  onBack: () => void;
}

interface RiskFactors {
  pepStatus: boolean;
  highRiskCountry: boolean;
  highValueTransaction: boolean;
  unusualActivity: boolean;
  documentVerificationScore: number;
}

export const RiskAnalysisSection: React.FC<RiskAnalysisSectionProps> = ({
  kycCaseId,
  onComplete,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactors | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    analyzeRisk();
  }, [kycCaseId]);

  const analyzeRisk = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Fetch KYC details for analysis
      const response = await fetch(`${apiUrl}/kyc/screen-data/${kycCaseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch KYC data for analysis');
      }
      
      const data = await response.json();
      
      // Mock risk analysis (replace with actual risk analysis logic)
      const mockRiskFactors: RiskFactors = {
        pepStatus: data.details?.is_pep || false,
        highRiskCountry: false, // Mock value
        highValueTransaction: data.details?.annual_income ? parseInt(data.details.annual_income) > 1000000 : false,
        unusualActivity: false, // Mock value
        documentVerificationScore: 0.85 // Mock value
      };

      // Calculate risk level based on factors
      let riskScore = 0;
      if (mockRiskFactors.pepStatus) riskScore += 3;
      if (mockRiskFactors.highRiskCountry) riskScore += 2;
      if (mockRiskFactors.highValueTransaction) riskScore += 2;
      if (mockRiskFactors.unusualActivity) riskScore += 3;
      riskScore += mockRiskFactors.documentVerificationScore * 2;

      const calculatedRiskLevel = riskScore >= 7 ? 'high' : riskScore >= 4 ? 'medium' : 'low';
      
      setRiskFactors(mockRiskFactors);
      setRiskLevel(calculatedRiskLevel);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error in risk analysis:', error);
      toast.error('Failed to complete risk analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <ShieldCheckIcon className="h-12 w-12 text-green-500" />;
      case 'medium':
        return <ShieldExclamationIcon className="h-12 w-12 text-yellow-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />;
      default:
        return null;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskMessage = () => {
    switch (riskLevel) {
      case 'low':
        return 'Low risk profile detected. Standard verification process completed.';
      case 'medium':
        return 'Medium risk profile detected. Additional verification may be required.';
      case 'high':
        return 'High risk profile detected. Enhanced due diligence required.';
      default:
        return 'Risk analysis in progress...';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing risk profile...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-6">
          {getRiskIcon()}
          <h2 className={`mt-4 text-2xl font-semibold ${getRiskColor()}`}>
            Risk Level: {riskLevel?.toUpperCase() || 'ANALYZING'}
          </h2>
          <p className="mt-2 text-gray-600">{getRiskMessage()}</p>
        </div>

        {riskFactors && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Risk Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">PEP Status</p>
                <p className="text-gray-600">{riskFactors.pepStatus ? 'PEP Identified' : 'No PEP'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">High-Risk Country</p>
                <p className="text-gray-600">{riskFactors.highRiskCountry ? 'Yes' : 'No'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">High-Value Transaction</p>
                <p className="text-gray-600">{riskFactors.highValueTransaction ? 'Yes' : 'No'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">Document Verification Score</p>
                <p className="text-gray-600">{(riskFactors.documentVerificationScore * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            onClick={onComplete}
            disabled={!analysisComplete}
          >
            Continue to Review
          </Button>
        </div>
      </Card>
    </div>
  );
}; 