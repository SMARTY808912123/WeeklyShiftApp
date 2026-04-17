import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './WeeklyShift.module.scss';
import { IWeeklyShiftProps } from './IWeeklyShiftProps';
import { getSP } from '../../../pnpjsConfig';
import { SPFI } from '@pnp/sp';
import { ShiftForm } from './ShiftForm';
import { AdminDashboard } from './AdminDashboard';
import { Pivot, PivotItem, Spinner } from '@fluentui/react';

export default function WeeklyShift(props: IWeeklyShiftProps) {
  const sp: SPFI = getSP();
  const [role, setRole] = useState<'Staff' | 'ROIT' | 'Admin' | null>(null);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      // Logic for RBAC. In a real environment, you'd check sp.web.currentUser.groups()
      // For this implementation, we use a simple claim or hardcoded groups.
      // E.g., if user is in "Shift Admins" -> 'Admin'
      // E.g., if user is in "ROIT" -> 'ROIT'
      // Default: 'Staff'
      
      const groups = await sp.web.currentUser.groups();
      const groupNames = groups.map(g => g.Title);
      
      if (groupNames.indexOf('Shift Admins') > -1) {
        setRole('Admin');
      } else if (groupNames.indexOf('ROIT') > -1) {
        setRole('ROIT');
      } else {
        setRole('Staff');
      }
    } catch (err) {
      console.error(err);
      // Fallback
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
