import React, { useState } from 'react';

export default function StudentPlacement({ 
  studentId, 
  approvedCompanies, 
  selectedCompanyId, 
  newCompanyName,
  onCompanyChange,
  onNewCompanyChange,
  onSubmit 