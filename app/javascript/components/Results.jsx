import React, {useEffect, useState} from 'react';
import { createRoot } from 'react-dom/client';

const ResultsViewer = (props) => {
    const { surveys, submissions } = props;

    const [selectedSurveyId, setSelectedSurveyId] = useState(surveys[0]?.id || '');
    const [selectedRole, setSelectedRole] = useState('all');

    useEffect(() => {
        console.log('Surveys:', surveys);
        console.log('Submissions:', submissions);
    }, [surveys, submissions]);

    return (
        <div className="mb-6 p-4 bg-white shadow rounded">
            <div className="flex space-x-4">
                {/* Survey dropdown */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Survey</label>
                    <select
                        value={selectedSurveyId}
                        onChange={(e) => setSelectedSurveyId(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {surveys.map((survey) => (
                            <option key={survey.id} value={survey.id}>
                                {survey.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Role dropdown */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="all">All Roles</option>
                        <option value="engineer">Engineer</option>
                        <option value="designer">Designer</option>
                        <option value="product_manager">Product Manager</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

const initializeResultsViewer = () => {
    const container = document.getElementById('results-container');
    if (container && !container.hasAttribute('data-react-initialized')) {
        console.log(container.dataset)
        const surveys = JSON.parse(container.dataset.surveys || '[]');
        const submissions = JSON.parse(container.dataset.submissions || '[]');

        container.setAttribute('data-react-initialized', 'true');

        const root = createRoot(container);
        root.render(<ResultsViewer surveys={surveys} submissions={submissions} />);
    }
};


initializeResultsViewer();
document.addEventListener('DOMContentLoaded', initializeResultsViewer);
document.addEventListener('turbo:load', initializeResultsViewer);

export default ResultsViewer;


