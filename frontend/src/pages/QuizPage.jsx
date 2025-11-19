import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        category: '',
        age: '',
        income: '',
        budget: '',
        dependents: '',
        riskTolerance: 3,
        // Auto specific
        vehicleMake: '',
        vehicleYear: '',
        vehicleValue: '',
        // Life specific
        smoker: false,
        conditions: false,
        coverageGoal: '',
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Send to backend
        console.log("Submitting quiz:", formData);
        // Navigate to results (mock)
        navigate('/results', { state: { recommendations: [] } }); // We'll implement results page next
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What are you looking to cover?</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {['Auto', 'Life', 'Funeral'].map((cat) => (
                    <div
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`cursor-pointer rounded-lg border p-6 text-center hover:border-primary hover:bg-blue-50 ${formData.category === cat ? 'border-primary bg-blue-50 ring-2 ring-primary' : 'border-gray-300'
                            }`}
                    >
                        <span className="block text-lg font-medium text-gray-900">{cat} Insurance</span>
                    </div>
                ))}
            </div>
            {formData.category && (
                <div className="flex justify-end">
                    <button
                        onClick={nextStep}
                        className="rounded-md bg-primary px-6 py-2 text-white hover:bg-blue-700"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Tell us a bit about yourself</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Income (BWP)</label>
                    <input
                        type="number"
                        name="income"
                        value={formData.income}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Insurance Budget (BWP)</label>
                    <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dependents</label>
                    <input
                        type="number"
                        name="dependents"
                        value={formData.dependents}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
            </div>
            <div className="flex justify-between">
                <button onClick={prevStep} className="text-gray-600 hover:text-gray-900">Back</button>
                <button onClick={nextStep} className="rounded-md bg-primary px-6 py-2 text-white hover:bg-blue-700">Next</button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Specific Details</h2>

            {formData.category === 'Auto' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Make & Model</label>
                        <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Year</label>
                        <input type="number" name="vehicleYear" value={formData.vehicleYear} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Value (BWP)</label>
                        <input type="number" name="vehicleValue" value={formData.vehicleValue} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                    </div>
                </div>
            )}

            {(formData.category === 'Life' || formData.category === 'Funeral') && (
                <div className="space-y-4">
                    <div className="flex items-center">
                        <input type="checkbox" name="smoker" checked={formData.smoker} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label className="ml-2 block text-sm text-gray-900">Do you smoke?</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" name="conditions" checked={formData.conditions} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label className="ml-2 block text-sm text-gray-900">Any pre-existing medical conditions?</label>
                    </div>
                </div>
            )}

            <div className="flex justify-between">
                <button onClick={prevStep} className="text-gray-600 hover:text-gray-900">Back</button>
                <button onClick={handleSubmit} className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700">Get Recommendations</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white px-6 py-8 shadow sm:px-10">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Step {step} of 3</span>
                            <div className="h-2 w-full max-w-xs rounded-full bg-gray-200 ml-4">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${(step / 3) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>
            </div>
        </div>
    );
};

export default QuizPage;
