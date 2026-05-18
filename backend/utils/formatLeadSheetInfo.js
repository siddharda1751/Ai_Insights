
export const formatLeadSheetInfo = (lead) => {
    return {
        _id: lead._id,
        name: lead.name,
        email: lead.email,
        companyName: lead.companyName,
        companyWebsite: lead.companyWebsite,
        industry: lead.industry,
        status: lead.status,
        createdAt: lead.createdAt.toISOString(),
    };
}