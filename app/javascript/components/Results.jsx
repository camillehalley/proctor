import React, {useEffect, useState} from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ResultsViewer = (props) => {
    const { surveys, submissions } = props;

    if (!surveys || surveys.length === 0) {
        return <p>Loading surveys...</p>;
    }

    const [selectedSurveyId, setSelectedSurveyId] = useState(() => surveys[0]?.id.toString() || '');
    const [selectedRole, setSelectedRole] = useState('all');

    const selectedSurvey = surveys.find(s => s.id.toString() === selectedSurveyId);
    const questions = selectedSurvey?.questions || [];
    const matchingSubmissions = submissions.filter(sub =>
        sub.survey_id.toString() === selectedSurveyId &&
        (selectedRole === 'all' || sub.role === selectedRole)
    );
    const responses = matchingSubmissions.flatMap(sub =>
        (sub.responses || []).map(r => ({
            ...r,
            submission: { role: sub.role },
        }))
    );

    return (
        <div className="mb-6 p-4 bg-white shadow rounded">
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
            {questions.map(question => (
                <div key={question.id}>
                    {renderQuestionResults(question, responses)}
                </div>
            ))}
        </div>
    );
};

const renderQuestionResults = (question, responses) => {
    const questionResponses = responses.filter(r => r.question_id === question.id);

    if (question.question_type === 'rating') {
        const ratingCounts = {};
        questionResponses.forEach(r => {
            const rating = parseInt(r.value, 10);
            if (!isNaN(rating)) {
                ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
            }
        });

        const chartData = Array.from({ length: 5 }, (_, i) => ({
            label: (i + 1).toString(),
            count: ratingCounts[i + 1] || 0,
        }));

        return (
            <div className="mb-6 p-4 bg-white shadow rounded">
                <p className="text-gray-800 font-semibold mb-2">{question.content}</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="label" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (question.question_type === 'multiple_choice') {
        const choiceCounts = {};
        const allChoices = question.options || []
        console.log(allChoices)

        questionResponses.forEach(r => {
            const answer = r.value;
            choiceCounts[answer] = (choiceCounts[answer] || 0) + 1;
        });

        console.log(questionResponses)

        // Ensure all choices are represented in chartData
        const chartData = allChoices.map(choice => ({
            label: choice,
            count: choiceCounts[choice] || 0,
        }));

        return (
            <div className="mb-6 p-4 bg-white shadow rounded">
                <p className="text-gray-800 font-semibold mb-2">{question.content}</p>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="label" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

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


