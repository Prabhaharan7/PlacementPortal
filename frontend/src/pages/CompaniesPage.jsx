import React, { useState, useEffect } from 'react';
import { Building2, MapPin, DollarSign, Users, Briefcase, ExternalLink, Star } from 'lucide-react';

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Token ${token}` };

            // Fetch Companies
            const compRes = await fetch('/api/companies/', { headers });
            if (compRes.ok) {
                const compData = await compRes.json();
                setCompanies(compData.companies || []);
            }

            // Fetch Applications
            const appRes = await fetch('/api/applications/', { headers });
            if (appRes.ok) {
                const appData = await appRes.json();
                setApplications(appData.applications || []);
            }
        } catch (error) {
            console.error('Failed to load companies data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApply = async (companyId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/companies/${companyId}/apply/`, {
                method: 'POST',
                headers: { 'Authorization': `Token ${token}` }
            });
            if (res.ok) {
                // Refresh data to reflect new application status
                fetchData();
            } else {
                alert('Application failed. Please try again.');
            }
        } catch (error) {
            console.error('Error applying to company:', error);
            alert('An error occurred while applying.');
        }
    };

    const CompanyCard = ({ company }) => {
        const app = applications.find(a => a.company_id === company.id);
        const status = app ? app.status : null;
        const statusColor = status === 'shortlisted' ? 'bg-success/20 text-success' :
            status === 'offered' ? 'bg-purple-100 text-purple-600' :
                status === 'rejected' ? 'bg-red-100 text-red-600' :
                    'bg-warning/20 text-warning';

        return (
            <div className="bg-card border border-border rounded-xl p-6 hover:border-accent transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-xl font-bold">
                            {company.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover rounded-xl" /> : company.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-text-primary">{company.name}</h3>
                            <div className="flex items-center space-x-1 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">{company.company_type}</span>
                            </div>
                        </div>
                    </div>
                    {company.applied && status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor}`}>
                            {status}
                        </span>
                    )}
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-text-secondary line-clamp-2 text-sm h-10">
                        <span>{company.description || 'No description available.'}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-text-secondary mt-4">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium text-gray-800">{company.ctc_min && company.ctc_max ? `₹${company.ctc_min} - ${company.ctc_max} LPA` : 'Package TBA'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-text-secondary">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm text-gray-700">{company.roles_offered?.length ? company.roles_offered.join(', ') : 'Roles TBA'}</span>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => handleApply(company.id)}
                        disabled={company.applied}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${company.applied
                            ? 'bg-secondary text-text-primary border border-border cursor-not-allowed opacity-70'
                            : 'bg-accent hover:bg-accent-hover text-white'
                            }`}>
                        {company.applied ? 'Applied' : 'Apply Now'}
                    </button>
                    <button className="p-3 bg-secondary hover:bg-primary border border-border rounded-lg transition-colors">
                        <ExternalLink className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Companies</h1>
                    <p className="text-text-secondary">Browse and apply to companies</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                    <Building2 className="w-8 h-8 text-accent mb-3" />
                    <p className="text-text-secondary text-sm mb-1">Total Companies</p>
                    <p className="text-3xl font-bold text-text-primary">{companies.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <Briefcase className="w-8 h-8 text-success mb-3" />
                    <p className="text-text-secondary text-sm mb-1">Applied</p>
                    <p className="text-3xl font-bold text-text-primary">{applications.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <Users className="w-8 h-8 text-warning mb-3" />
                    <p className="text-text-secondary text-sm mb-1">Shortlisted</p>
                    <p className="text-3xl font-bold text-text-primary">
                        {applications.filter(a => a.status === 'shortlisted').length}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <Star className="w-8 h-8 text-purple-400 mb-3" />
                    <p className="text-text-secondary text-sm mb-1">Interviews</p>
                    <p className="text-3xl font-bold text-text-primary">
                        {applications.filter(a => a.status === 'interview').length}
                    </p>
                </div>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => (
                    <CompanyCard key={company.id} company={company} />
                ))}
            </div>

            {/* Application Status */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-text-primary">My Applications</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-6 py-4 text-left text-text-secondary font-medium">Company</th>
                                <th className="px-6 py-4 text-left text-text-secondary font-medium">Role</th>
                                <th className="px-6 py-4 text-left text-text-secondary font-medium">Status</th>
                                <th className="px-6 py-4 text-left text-text-secondary font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.id} className="border-b border-border hover:bg-primary/50 transition-colors">
                                    <td className="px-6 py-4 text-text-primary font-medium">{app.company}</td>
                                    <td className="px-6 py-4 text-text-secondary">{app.role}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'Shortlisted'
                                            ? 'bg-success/20 text-success'
                                            : app.status === 'Under Review'
                                                ? 'bg-warning/20 text-warning'
                                                : 'bg-danger/20 text-danger'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">{app.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompaniesPage;
