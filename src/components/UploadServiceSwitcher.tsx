import React, { useState, useEffect } from 'react';
import { useUploadService } from '@/hooks/useUploadService';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface UploadServiceSwitcherProps {
  showTesting?: boolean;
}

export const UploadServiceSwitcher: React.FC<UploadServiceSwitcherProps> = ({ 
  showTesting = process.env.NEXT_PUBLIC_SHOW_UPLOAD_TESTING === 'true' 
}) => {
  const {
    currentService,
    serviceConfig,
    isNewService,
    isExistingService,
    isNewServiceAvailable,
    testNewService,
    lastUploadResult,
  } = useUploadService();

  const [isNewServiceHealthy, setIsNewServiceHealthy] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Check new service health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await isNewServiceAvailable();
      setIsNewServiceHealthy(healthy);
    };
    checkHealth();
  }, [isNewServiceAvailable]);

  // Test the new service
  const handleTestNewService = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Create a test file
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const result = await testNewService(testFile);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  // If testing is disabled, show minimal service indicator
  if (!showTesting) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Upload Service</h4>
            <p className="text-sm text-gray-600">
              {isNewService ? 'New Lambda Service' : 'Existing Service'}
            </p>
          </div>
          <div className="flex items-center">
            {isNewService ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <InformationCircleIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Upload Service Configuration</h3>
        <button
          onClick={handleTestNewService}
          disabled={isTesting}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
          {isTesting ? 'Testing...' : 'Test New Service'}
        </button>
      </div>

      {/* Current Service Status */}
      <div className="bg-gray-50 rounded-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Current Service</h4>
            <p className="text-sm text-gray-600">
              {isNewService ? 'New Lambda Service' : 'Existing Service'}
            </p>
          </div>
          <div className="flex items-center">
            {isNewService ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <InformationCircleIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>
        </div>
      </div>

      {/* Service Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900">New Service (Lambda)</h4>
          <p className="text-xs text-blue-700 mt-1 break-all">
            {serviceConfig.newServiceUrl}
          </p>
          <div className="mt-2 flex items-center">
            {isNewServiceHealthy === null ? (
              <div className="text-xs text-blue-600">Checking health...</div>
            ) : isNewServiceHealthy ? (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Healthy
              </div>
            ) : (
              <div className="flex items-center text-xs text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Unavailable
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900">Existing Service</h4>
          <p className="text-xs text-gray-700 mt-1">
            {serviceConfig.existingServiceUrl}
          </p>
          <div className="mt-2">
            <div className="flex items-center text-xs text-gray-600">
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              Always Available
            </div>
          </div>
        </div>
      </div>

      {/* Environment Variable Info */}
      <div className="bg-yellow-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-yellow-900">Configuration</h4>
        <p className="text-xs text-yellow-700 mt-1">
          To switch services, set the environment variable:
        </p>
        <code className="block mt-2 text-xs bg-yellow-100 p-2 rounded">
          NEXT_PUBLIC_UPLOAD_SERVICE=new
        </code>
        <p className="text-xs text-yellow-700 mt-2">
          Valid values: <code className="bg-yellow-100 px-1 rounded">new</code> or <code className="bg-yellow-100 px-1 rounded">existing</code>
        </p>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`rounded-md p-4 ${
          testResult.success ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <h4 className={`text-sm font-medium ${
            testResult.success ? 'text-green-900' : 'text-red-900'
          }`}>
            Test Result
          </h4>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Last Upload Result */}
      {lastUploadResult && (
        <div className={`rounded-md p-4 ${
          lastUploadResult.success ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <h4 className={`text-sm font-medium ${
            lastUploadResult.success ? 'text-green-900' : 'text-red-900'
          }`}>
            Last Upload Result
          </h4>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(lastUploadResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 