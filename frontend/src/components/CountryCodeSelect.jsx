import React from 'react';

const countryCodes = [
    { code: '+267', country: 'Botswana' },
    { code: '+27', country: 'South Africa' },
    { code: '+263', country: 'Zimbabwe' },
    { code: '+264', country: 'Namibia' },
    { code: '+260', country: 'Zambia' },
    { code: '+254', country: 'Kenya' },
    { code: '+234', country: 'Nigeria' },
    { code: '+233', country: 'Ghana' },
    { code: '+44', country: 'UK' },
    { code: '+1', country: 'USA/Canada' },
    // Add more as needed
];

const CountryCodeSelect = ({ value, onChange, name = "countryCode" }) => {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="block w-24 rounded-l-md border-gray-300 bg-gray-50 text-gray-500 sm:text-sm p-2 border-r-0 border focus:ring-primary focus:border-primary"
        >
            {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                    {c.code} ({c.country})
                </option>
            ))}
        </select>
    );
};

export default CountryCodeSelect;
