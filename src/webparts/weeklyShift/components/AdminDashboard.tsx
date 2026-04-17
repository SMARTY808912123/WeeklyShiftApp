import * as React from 'react';
import { useState, useEffect } from 'react';
import { getSP } from '../../../pnpjsConfig';
import { IWeeklyShiftProps } from './IWeeklyShiftProps';
import { SPFI } from '@pnp/sp';
import { DetailsList, DetailsListLayoutMode, IColumn, MessageBar, MessageBarType } from '@fluentui/react';

export const AdminDashboard: React.FC<IWeeklyShiftProps> = (props) => {
  const sp: SPFI = getSP();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      // Get today's date in ISO format start of day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Fetch all shifts
      const allShifts = await sp.web.lists.getByTitle("ITStaffShifts").items();
      
      // Filter for active shifts (today's date falls between From_Date and To_Date)
      const activeShifts = allShifts.filter(shift => {
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
