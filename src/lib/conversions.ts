import { ProductivityEntry, TechnicianType } from './types';

export const calculateNormalizedProductivity = (
  entry: ProductivityEntry,
  type: TechnicianType
) => {
  // Conversions based on rules:
  // 3 household devices = 1 chimney
  // 1 chimney = 3 household devices
  // 1 commercial device = 1.5 household devices
  
  const householdCount = 
    entry.gasStoveConversions + 
    entry.waterHeaterConversions + 
    entry.householdApplianceReplacements;
    
  const commercialCount = 
    entry.commercialApplianceReplacements + 
    entry.commercialApplianceConversions;
    
  const chimneyCount = entry.chimneyInstallations;

  if (type === 'فني مدخنة') {
    // Target is in Chimneys
    // household devices to chimney: count / 3
    // commercial devices to chimney: (count * 1.5) / 3 = count * 0.5
    // chimneys are already chimneys
    return chimneyCount + (householdCount / 3) + (commercialCount * 0.5);
  } else {
    // Target is in Devices
    // chimney to household devices: count * 3
    // commercial to household: count * 1.5
    // household is already household
    return householdCount + (commercialCount * 1.5) + (chimneyCount * 3);
  }
};

export const getMonthYearString = (date: Date) => {
  return date.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
};

export const filterEntriesByMonth = (entries: ProductivityEntry[], year: number, month: number) => {
  return entries.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
};