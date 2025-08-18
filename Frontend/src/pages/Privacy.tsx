import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl text-gray-200">
      <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-300">
        DevSwap uses cookies and local storage to remember your preferences and improve your experience. 
        Authentication may use a combination of secure httpOnly cookies and an access token stored in local storage 
        (only if you have accepted cookies). If you decline, we will not store your token or persist app state in local storage.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">What We Store</h2>
      <ul className="list-disc pl-6 text-sm text-gray-300 space-y-1">
        <li>Session cookies (httpOnly) for secure authentication with the server</li>
        <li>Access token in local storage (only if you have accepted cookies)</li>
        <li>Basic app preferences (only if you have accepted cookies)</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Choices</h2>
      <ul className="list-disc pl-6 text-sm text-gray-300 space-y-1">
        <li>Accept cookies to enable persistence and smoother login</li>
        <li>Decline cookies to prevent local storage persistence</li>
        <li>You can change your decision anytime by clearing site data in your browser</li>
      </ul>
      <p className="mt-6 text-sm text-gray-400">
        For questions or requests related to your data, please contact support@devswap.live
      </p>
    </div>
  );
};

export default Privacy;
