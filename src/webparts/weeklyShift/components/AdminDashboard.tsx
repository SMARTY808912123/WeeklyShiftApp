import * as React from 'react';
import { useState, useEffect } from 'react';
import { IWeeklyShiftProps } from './IWeeklyShiftProps';
import { DetailsList, DetailsListLayoutMode, IColumn, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export const AdminDashboard: React.FC<IWeeklyShiftProps> = (props) => {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const listName = "ITStaffShifts";
      const siteUrl = props.context.pageContext.web.absoluteUrl;
      const apiUrl = `${siteUrl}/_api/web/lists/getByTitle('${listName}')/items?$top=5000`;
      
      const response: SPHttpClientResponse = await props.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1);
      
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      
      const data = await response.json();
      const allShifts = data.value;
      
      const activeShifts = allShifts.filter((shift: any) => {
        const fromD = new Date(shift.From_Date);
        const toD = new Date(shift.To_Date);
        return today >= fromD && today <= toD;
      });
      
      setItems(activeShifts);
    } catch (err) {
      console.error(err);
      setError('Could not load shifts. Ensure the ITStaffShifts list exists.');
    }
  };

  const columns: IColumn[] = [
    { key: 'col1', name: 'Emp ID', fieldName: 'Title', minWidth: 70, maxWidth: 90, isResizable: true },
    { key: 'col2', name: 'Name', fieldName: 'EmpName', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: 'col3', name: 'Region', fieldName: 'Region', minWidth: 70, maxWidth: 100, isResizable: true },
    { key: 'col4', name: 'Zone', fieldName: 'Zone', minWidth: 70, maxWidth: 100, isResizable: true },
    { key: 'col5', name: 'Department', fieldName: 'Department', minWidth: 80, maxWidth: 120, isResizable: true },
    { key: 'col6', name: 'Shift Time', fieldName: 'Shift_Type', minWidth: 80, maxWidth: 120, isResizable: true },
    { key: 'col7', name: 'Mobile', fieldName: 'Mobile', minWidth: 90, maxWidth: 120, isResizable: true }
  ];

  return (
    <div style={{ padding: 20 }}>
      <h3>Admin Dashboard - Today's Shifts</h3>
      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
      <DetailsList
        items={items}
        columns={columns}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionPreservedOnEmptyClick={true}
      />
    </div>
  );
};
