import * as React from 'react';
import { useState } from 'react';
import { IWeeklyShiftProps } from './IWeeklyShiftProps';
import { PrimaryButton, TextField, Dropdown, IDropdownOption, DatePicker, Stack, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { SPHttpClient, ISPHttpClientOptions } from '@microsoft/sp-http';

export const ShiftForm: React.FC<IWeeklyShiftProps> = (props) => {
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState(props.context.pageContext.user.displayName);
  const [email, setEmail] = useState(props.context.pageContext.user.email);
  const [zone, setZone] = useState('');
  const [region, setRegion] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [mobile, setMobile] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [shiftType, setShiftType] = useState<string>('General');
  
  const [message, setMessage] = useState<{type: MessageBarType, text: string} | null>(null);

  const shiftOptions: IDropdownOption[] = [
    { key: 'Morning', text: 'Morning' },
    { key: 'General', text: 'General' },
    { key: 'Evening', text: 'Evening' },
    { key: 'OD', text: 'OD' },
    { key: 'Leave', text: 'Leave' }
  ];

  const handleSubmit = async () => {
    try {
      if (!empId || !fromDate || !toDate) {
        setMessage({ type: MessageBarType.error, text: 'Please fill all required fields.' });
        return;
      }

      const listName = "ITStaffShifts";
      const siteUrl = props.context.pageContext.web.absoluteUrl;
      const apiUrl = `${siteUrl}/_api/web/lists/getByTitle('${listName}')/items`;

      const requestBody = JSON.stringify({
        '__metadata': { 'type': `SP.Data.${listName}ListItem` },
        'Title': empId,
        'EmpName': empName,
        'Email': email,
        'Zone': zone,
        'Region': region,
        'Department': department,
        'Designation': designation,
        'Mobile': mobile,
        'From_Date': fromDate.toISOString(),
        'To_Date': toDate.toISOString(),
        'Shift_Type': shiftType
      });

      const spOpts: ISPHttpClientOptions = {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=verbose',
          'odata-version': ''
        },
        body: requestBody
      };

      const response = await props.context.spHttpClient.post(apiUrl, SPHttpClient.configurations.v1, spOpts);

      if (response.ok) {
        setMessage({ type: MessageBarType.success, text: 'Shift submitted successfully!' });
      } else {
        setMessage({ type: MessageBarType.error, text: `Error: ${response.statusText}` });
      }
    } catch (err) {
      setMessage({ type: MessageBarType.error, text: 'Network Error submitting shift.' });
      console.error(err);
    }
  };

  return (
    <Stack tokens={{ childrenGap: 15 }} styles={{ root: { padding: 20 }}}>
      {message && <MessageBar messageBarType={message.type}>{message.text}</MessageBar>}
      <h3>My Weekly Shift</h3>
      
      <TextField label="Employee ID" required value={empId} onChange={(e, val) => setEmpId(val || '')} />
      <TextField label="Name" value={empName} onChange={(e, val) => setEmpName(val || '')} />
      <TextField label="Email" value={email} onChange={(e, val) => setEmail(val || '')} />
      
      <Stack horizontal tokens={{ childrenGap: 15 }}>
        <TextField label="Zone" value={zone} onChange={(e, val) => setZone(val || '')} />
        <TextField label="Region" value={region} onChange={(e, val) => setRegion(val || '')} />
      </Stack>

      <Stack horizontal tokens={{ childrenGap: 15 }}>
        <TextField label="Department" value={department} onChange={(e, val) => setDepartment(val || '')} />
        <TextField label="Designation" value={designation} onChange={(e, val) => setDesignation(val || '')} />
        <TextField label="Mobile" value={mobile} onChange={(e, val) => setMobile(val || '')} />
      </Stack>
      
      <Stack horizontal tokens={{ childrenGap: 15 }}>
        <DatePicker label="From Date" isRequired value={fromDate} onSelectDate={(d) => setFromDate(d || undefined)} />
        <DatePicker label="To Date" isRequired value={toDate} onSelectDate={(d) => setToDate(d || undefined)} />
        <Dropdown label="Shift Type" required options={shiftOptions} selectedKey={shiftType} onChange={(e, opt) => setShiftType(opt?.key as string || 'General')} />
      </Stack>
      
      <PrimaryButton text="Submit/Update Shift" onClick={handleSubmit} />
    </Stack>
  );
};
