import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

const ProductForm = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState(() => {
        // Ensure all required fields exist with defaults
        const defaults = {
            name: '',
            category: 'Auto',
            premium: '',
            status: 'Draft',
            requirements: []
        };

        // Merge initialData with defaults, ensuring requirements is always an array
        return {
            ...defaults,
            ...initialData,
            requirements: initialData?.requirements || []
        };
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRequirementChange = (index, value) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index] = value;
        setFormData(prev => ({ ...prev, requirements: newRequirements }));
    };

    const addRequirement = () => {
        setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
    };

    const removeRequirement = (index) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            premium: Number(formData.premium) // Ensure premium is a number
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="e.g. Gold Auto Cover"
                />
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    <option value="Auto">Auto</option>
                    <option value="Life">Life</option>
                    <option value="Home">Home</option>
                    <option value="Health">Health</option>
                </select>
            </div>

            <div>
                <label htmlFor="premium" className="block text-sm font-medium text-gray-700">Monthly Premium (BWP)</label>
                <input
                    type="number"
                    name="premium"
                    id="premium"
                    required
                    min="0"
                    value={formData.premium}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="0.00"
                />
            </div>

            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Requirements</label>
                {(formData.requirements || []).map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={req}
                            onChange={(e) => handleRequirementChange(index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="e.g. Must be over 25 years old"
                        />
                        <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="text-red-600 hover:text-red-800 px-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addRequirement}
                    className="mt-2 text-sm text-primary hover:text-blue-700 font-medium flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Requirement
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Policy Document (PDF/Text/Image)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".txt,.md,.pdf,.jpg,.jpeg,.png" onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        let fileToUpload = file;

                                        // Compress if image
                                        if (file.type.startsWith('image/')) {
                                            try {
                                                const options = {
                                                    maxSizeMB: 1,
                                                    maxWidthOrHeight: 1920,
                                                    useWebWorker: true
                                                };
                                                fileToUpload = await imageCompression(file, options);
                                                console.log(`Compressed file from ${file.size / 1024 / 1024} MB to ${fileToUpload.size / 1024 / 1024} MB`);
                                            } catch (error) {
                                                console.error("Compression failed:", error);
                                            }
                                        }

                                        setFormData(prev => ({ ...prev, policyFile: fileToUpload, policyFileName: fileToUpload.name }));
                                    }
                                }} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                            TXT, MD, PDF, JPG, PNG up to 10MB
                        </p>
                    </div>
                    {(formData.policyFile || formData.policyFileName) && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-md">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                                {formData.policyFile?.name || formData.policyFileName}
                            </p>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, policyFile: null, policyFileName: null }))}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Remove File
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    {initialData ? 'Update Product' : 'Add Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
