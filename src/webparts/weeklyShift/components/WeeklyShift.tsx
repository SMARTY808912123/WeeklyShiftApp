import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './WeeklyShift.module.scss';
import { IWeeklyShiftProps } from './IWeeklyShiftProps';
import { ShiftForm } from './ShiftForm';
import { AdminDashboard } from './AdminDashboard';
import { Pivot, PivotItem, Spinner } from 'office-ui-fabric-react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export default function WeeklyShift(props: IWeeklyShiftProps) {
  const [role, setRole] = useState<'Staff' | 'ROIT' | 'Admin' | null>(null);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      // Check current user groups via spHttpClient
      const url = `${props.context.pageContext.web.absoluteUrl}/_api/web/currentuser/groups?$select=Title`;
      const response: SPHttpClientResponse = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      const data = await response.json();
      
      const groupNames = data.value.map((g: any) => g.Title);
      
      if (groupNames.indexOf('Shift Admins') > -1) {
        setRole('Admin');
      } else if (groupNames.indexOf('ROIT') > -1) {
        setRole('ROIT');
      } else {
        setRole('Staff');
      }
    } catch (err) {
      console.error(err);
      setRole('Staff');
    }
  };

  if (!role) {
    return <Spinner label="Loading App..." />;
  }

  return (
    <section className={`${styles.weeklyShift}`}>
      <div className={styles.welcome}>
        <h2>Welcome, {props.context.pageContext.user.displayName}</h2>
      </div>

      <Pivot aria-label="Shift Application Pivot">
        <PivotItem headerText="My Shift">
          <ShiftForm {...props} />
        </PivotItem>
        
        { (role === 'ROIT' || role === 'Admin') && (
          <PivotItem headerText="Dashboard">
            <AdminDashboard {...props} />
          </PivotItem>
        )}
      </Pivot>
    </section>
  );
}
