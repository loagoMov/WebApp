import React, { useState } from 'react';

const BidForm = ({ products, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        productId: '',
        bidAmount: '',
        duration: '7', // days
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedProduct = products.find(p => p.id === formData.productId);
        onSubmit({
            ...formData,
            productName: selectedProduct ? selectedProduct.name : 'Unknown Product',
            bidAmount: Number(formData.bidAmount),
            duration: Number(formData.duration)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="productId" className="block text-sm font-medium text-gray-700">Select Product to Promote</label>
                <select
                    name="productId"
                    id="productId"
                    required
                    value={formData.productId}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    <option value="">-- Select a Product --</option>
                    {products.filter(p => p.status === 'Active').map(product => (
                        <option key={product.id} value={product.id}>
                            {product.name} ({product.category})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">Bid Amount (BWP)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">BWP</span>
                    </div>
                    <input
                        type="number"
                        name="bidAmount"
                        id="bidAmount"
                        required
                        min="10"
                        value={formData.bidAmount}
                        onChange={handleChange}
                        className="focus:ring-primary focus:border-primary block w-full pl-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="0.00"
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum bid is BWP 10.00</p>
            </div>

            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                <select
                    name="duration"
                    id="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                </select>
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
                    Place Bid
                </button>
            </div>
        </form>
    );
};

export default BidForm;
