import React, { useState, useEffect, useCallback, useMemo } from 'react';

// PERFORMANCE OPTIMIZATION: Static constants outside component
const STATIC_STYLES = {
  fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif',
  borderRadius32: '32px',
  borderRadius24: '24px'
};

const POINT_VALUES = {
  min: 0.015,
  max: 0.020,
  avg: 0.0175
};

const MULTIPLIERS = {
  chaseTravel: 8,
  flightsHotels: 4,
  dining: 3,
  otherSpending: 1
};

// REACT COMPATIBILITY: Validation helper functions
const validateInputs = (inputs) => {
  if (!inputs || typeof inputs !== 'object') {
    throw new Error('Invalid inputs: must be an object');
  }
  
  const safe = {};
  Object.keys(inputs).forEach(key => {
    const value = inputs[key];
    if (typeof value === 'number') {
      safe[key] = isNaN(value) || !isFinite(value) ? 0 : value;
    } else if (typeof value === 'boolean') {
      safe[key] = value;
    } else {
      safe[key] = 0;
    }
  });
  
  return safe;
};

const isValidResults = (results) => {
  if (!results || typeof results !== 'object') return false;
  
  const requiredKeys = ['totalValue', 'totalCost', 'roi', 'minROI', 'maxROI', 'breakdown'];
  return requiredKeys.every(key => key in results);
};

const SapphireReserveROICalculator = () => {
  const [inputs, setInputs] = useState({
    chaseTravel: 0,
    flightsHotels: 0,
    dining: 0,
    otherSpending: 0,
    travelCreditUsage: 300,
    editStaysValue: 0,
    stubhubSpending: 0,
    diningCredit: 300,
    dashpassUsage: 12,
    restaurantOrders: false,
    nonRestaurantOrders: false,
    lyftRides: 0,
    pelotonMembership: false,
    pelotonEquipment: 0,
    appleServices: false,
    priorityPassVisits: 0,
    globalEntryValue: false,
    useShopsCredit: false,
    useSouthwestCredit: false,
    useIHGDiamond: false,
    useSouthwestAList: false
  });

  const [results, setResults] = useState({
    totalValue: 0,
    totalCost: 795,
    roi: 0,
    minROI: 0,
    maxROI: 0,
    breakdown: {}
  });

  // PERFORMANCE + REACT COMPATIBILITY: Memoized calculations
  const totalAnnualSpending = useMemo(() => {
    try {
      const total = inputs.chaseTravel + inputs.flightsHotels + inputs.dining + inputs.otherSpending;
      return isNaN(total) ? 0 : total;
    } catch (error) {
      console.error('Error calculating total spending:', error);
      return 0;
    }
  }, [inputs.chaseTravel, inputs.flightsHotels, inputs.dining, inputs.otherSpending]);

  const qualifiesForHighSpender = useMemo(() => 
    totalAnnualSpending >= 75000,
    [totalAnnualSpending]
  );

  // CRITICAL FIX + PERFORMANCE + REACT COMPATIBILITY: Pure, stable calculateROI
  const calculateROI = useCallback(() => {
    try {
      const safeInputs = validateInputs(inputs);
      
      let totalValue = 0;
      let minValue = 0;
      let maxValue = 0;
      let breakdown = {};

      const totalPoints = (safeInputs.chaseTravel * MULTIPLIERS.chaseTravel) + 
                         (safeInputs.flightsHotels * MULTIPLIERS.flightsHotels) + 
                         (safeInputs.dining * MULTIPLIERS.dining) + 
                         (safeInputs.otherSpending * MULTIPLIERS.otherSpending);
      
      if (isNaN(totalPoints) || !isFinite(totalPoints)) {
        throw new Error('Invalid points calculation');
      }

      const pointsValue = totalPoints * POINT_VALUES.avg;

      breakdown.points = {
        value: pointsValue,
        min: totalPoints * POINT_VALUES.min,
        max: totalPoints * POINT_VALUES.max,
        details: totalPoints.toLocaleString() + ' points earned'
      };

      const travelCredit = Math.min(Math.max(safeInputs.travelCreditUsage || 0, 0), 300);
      breakdown.travelCredit = {
        value: travelCredit,
        min: travelCredit,
        max: travelCredit,
        details: '$' + travelCredit + ' travel credit used'
      };

      const diningCreditValue = Math.min(Math.max(safeInputs.diningCredit || 0, 0), 300);
      breakdown.diningCredit = {
        value: diningCreditValue,
        min: diningCreditValue,
        max: diningCreditValue,
        details: '$' + diningCreditValue + ' annual dining credit'
      };

      const editCredit = Math.min(Math.max(safeInputs.editStaysValue || 0, 0), 500);
      if (editCredit > 0) {
        breakdown.editCredit = {
          value: editCredit,
          min: editCredit,
          max: editCredit,
          details: '$' + editCredit + ' Edit stays credit'
        };
      }

      const stubhubCredit = Math.min(Math.max(safeInputs.stubhubSpending || 0, 0), 300);
      if (stubhubCredit > 0) {
        breakdown.stubhubCredit = {
          value: stubhubCredit,
          min: stubhubCredit,
          max: stubhubCredit,
          details: '$' + stubhubCredit + ' StubHub credit'
        };
      }

      const dashpassValue = (safeInputs.dashpassUsage || 0) * 9.99;
      if (dashpassValue > 0) {
        breakdown.dashpass = {
          value: dashpassValue,
          min: dashpassValue * 0.5,
          max: dashpassValue,
          details: (safeInputs.dashpassUsage || 0) + ' months of DashPass'
        };
      }

      const restaurantCredits = (safeInputs.restaurantOrders ? 1 : 0) * 5 * 12;
      const nonRestaurantCredits = (safeInputs.nonRestaurantOrders ? 2 : 0) * 10 * 12;
      const totalDoorDashCredits = restaurantCredits + nonRestaurantCredits;
      if (totalDoorDashCredits > 0) {
        breakdown.doorDashCredits = {
          value: totalDoorDashCredits,
          min: totalDoorDashCredits * 0.7,
          max: totalDoorDashCredits,
          details: 'DoorDash credits: $' + totalDoorDashCredits + '/year'
        };
      }

      const lyftCredits = Math.min((safeInputs.lyftRides || 0) * 10, 120);
      const lyftBonusPoints = (safeInputs.lyftRides || 0) * 20 * 4;
      const lyftTotal = lyftCredits + (lyftBonusPoints * POINT_VALUES.avg);
      if (lyftTotal > 0) {
        breakdown.lyft = {
          value: lyftTotal,
          min: lyftCredits + (lyftBonusPoints * POINT_VALUES.min),
          max: lyftCredits + (lyftBonusPoints * POINT_VALUES.max),
          details: 'Lyft credits and bonus points'
        };
      }

      let pelotonValue = 0;
      if (safeInputs.pelotonMembership) {
        pelotonValue += 120;
      }
      if (safeInputs.pelotonEquipment > 0) {
        const bonusPoints = Math.min(safeInputs.pelotonEquipment, 5000) * 9;
        pelotonValue += bonusPoints * POINT_VALUES.avg;
      }
      if (pelotonValue > 0) {
        breakdown.peloton = {
          value: pelotonValue,
          min: pelotonValue * 0.8,
          max: pelotonValue * 1.2,
          details: 'Peloton benefits'
        };
      }

      const priorityPassValue = (safeInputs.priorityPassVisits || 0) * 35;
      if (priorityPassValue > 0) {
        breakdown.priorityPass = {
          value: priorityPassValue,
          min: priorityPassValue * 0.5,
          max: priorityPassValue * 1.5,
          details: (safeInputs.priorityPassVisits || 0) + ' lounge visits'
        };
      }

      const globalEntryValue = safeInputs.globalEntryValue ? 24 : 0;
      if (globalEntryValue > 0) {
        breakdown.globalEntry = {
          value: globalEntryValue,
          min: globalEntryValue,
          max: globalEntryValue,
          details: 'Global Entry credit ($120 every 5 years)'
        };
      }

      const appleServicesValue = safeInputs.appleServices ? (6.99 + 10.99) * 12 : 0;
      if (appleServicesValue > 0) {
        breakdown.appleServices = {
          value: appleServicesValue,
          min: appleServicesValue * 0.3,
          max: appleServicesValue,
          details: 'Apple TV+ and Apple Music'
        };
      }

      let highSpenderValue = 0;
      if (qualifiesForHighSpender) {
        if (safeInputs.useShopsCredit) highSpenderValue += 250;
        if (safeInputs.useSouthwestCredit) highSpenderValue += 500;
        if (safeInputs.useIHGDiamond) highSpenderValue += 200;
        if (safeInputs.useSouthwestAList) highSpenderValue += 150;
      }
      
      if (highSpenderValue > 0) {
        breakdown.highSpender = {
          value: highSpenderValue,
          min: highSpenderValue * 0.8,
          max: highSpenderValue * 1.2,
          details: 'High spender benefits: $' + highSpenderValue + ' selected'
        };
      }

      const benefitValues = Object.values(breakdown);
      totalValue = benefitValues.reduce((sum, benefit) => {
        const value = benefit?.value || 0;
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
      
      minValue = benefitValues.reduce((sum, benefit) => {
        const value = benefit?.min || 0;
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
      
      maxValue = benefitValues.reduce((sum, benefit) => {
        const value = benefit?.max || 0;
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      const roi = totalValue > 0 ? ((totalValue - 795) / 795) * 100 : -100;
      const minROI = minValue > 0 ? ((minValue - 795) / 795) * 100 : -100;
      const maxROI = maxValue > 0 ? ((maxValue - 795) / 795) * 100 : -100;

      const results = {
        totalValue: isNaN(totalValue) ? 0 : totalValue,
        totalCost: 795,
        roi: isNaN(roi) ? -100 : roi,
        minROI: isNaN(minROI) ? -100 : minROI,
        maxROI: isNaN(maxROI) ? -100 : maxROI,
        breakdown
      };

      if (!isValidResults(results)) {
        throw new Error('Invalid calculation results structure');
      }

      return results;
      
    } catch (error) {
      console.error('ROI calculation error:', error);
      return {
        totalValue: 0,
        totalCost: 795,
        roi: -100,
        minROI: -100,
        maxROI: -100,
        breakdown: {}
      };
    }
  }, [inputs, qualifiesForHighSpender]);

  // CRITICAL FIX: Side effects only in useEffect
  useEffect(() => {
    try {
      const newResults = calculateROI();
      setResults(newResults);
    } catch (error) {
      console.error('Failed to update results:', error);
      setResults({
        totalValue: 0,
        totalCost: 795,
        roi: -100,
        minROI: -100,
        maxROI: -100,
        breakdown: {}
      });
    }
  }, [calculateROI]);

  // Ko-fi widget initialization
  useEffect(() => {
    // Add minimal Ko-fi styling to ensure it's clickable
    const style = document.createElement('style');
    style.textContent = `
      /* Minimal Ko-fi styling - ensure clickability */
      .ko-fi-button-container {
        pointer-events: auto !important;
      }
      
      .ko-fi-button-container * {
        pointer-events: auto !important;
      }
      
      /* Style the Ko-fi button lightly to match theme */
      .floating-chat-kofi-popup {
        border-radius: 16px !important;
        font-family: 'Futura', 'Trebuchet MS', Arial, sans-serif !important;
        font-weight: bold !important;
        transition: transform 0.2s ease !important;
      }
      
      .floating-chat-kofi-popup:hover {
        transform: scale(1.02) !important;
      }
      
      /* Ensure iframe is clickable */
      iframe[src*="ko-fi"] {
        pointer-events: auto !important;
        border-radius: 16px !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Load Ko-fi widget script
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
    script.async = true;
    
    script.onload = () => {
      if (window.kofiwidget2) {
        // Use default Ko-fi colors for better visibility and functionality
        window.kofiwidget2.init('Support Valoretti ☕', '#FF5E5B', 'I3I71IMKB3');
        window.kofiwidget2.draw();
        
        // Create second Ko-fi widget for the bottom button
        setTimeout(() => {
          if (document.getElementById('kofi-widget-2')) {
            const kofiHtml = `<a href='https://ko-fi.com/I3I71IMKB3' target='_blank'><img height='36' style='border:0px;height:36px;border-radius:16px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>`;
            document.getElementById('kofi-widget-2').innerHTML = kofiHtml;
          }
        }, 500);
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup: remove script and style when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // PERFORMANCE + REACT COMPATIBILITY: Stable event handler
  const handleInputChange = useCallback((field, value) => {
    try {
      if (['chaseTravel', 'flightsHotels', 'dining', 'otherSpending'].includes(field)) {
        const numValue = Number(value);
        value = isNaN(numValue) ? 0 : numValue;
      }
      
      setInputs(prev => ({
        ...prev,
        [field]: value
      }));
    } catch (error) {
      console.error('Input change error:', error);
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F0' }}>
      {/* Header */}
      <div className="relative" style={{ backgroundColor: '#C8512F' }}>
        
        <div className="max-w-7xl mx-auto px-8 py-16 text-center relative">
          <h1 className="text-6xl font-black text-white mb-4 tracking-tight" 
              style={{ fontFamily: STATIC_STYLES.fontFamily }}>
            VALORETTI
          </h1>
          <h2 className="text-2xl font-bold text-white tracking-wider" 
              style={{ fontFamily: STATIC_STYLES.fontFamily }}>
            SAPPHIRE RESERVE ROI CALCULATOR
          </h2>
          
          {/* Disclaimer box */}
          <div className="mt-8 inline-block px-8 py-4 bg-black text-white font-bold text-sm tracking-wide">
            EXISTING CARDHOLDERS ONLY • NO SIGN-UP BONUSES INCLUDED
          </div>
        </div>
        
        {/* Bottom geometric strip */}
        <div className="h-4 w-full" style={{ backgroundColor: '#E9C46A' }}></div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Input Column 1 - Spending */}
          <div className="space-y-8">
            {/* Divisumma-style curved profile container */}
            <div className="relative" 
                 style={{ 
                   background: 'linear-gradient(135deg, #E9C46A 0%, #D4A574 50%, #E9C46A 100%)',
                   borderRadius: STATIC_STYLES.borderRadius32,
                   boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)'
                 }}>
              
              <div className="p-8">
                <h3 className="text-2xl font-black text-black mb-8 tracking-wide" 
                    style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                  ANNUAL SPENDING
                </h3>
                
                <div className="space-y-6">
                  {[
                    { key: 'chaseTravel', label: 'CHASE TRAVEL (8×)', color: '#C8512F', symbol: '$' },
                    { key: 'flightsHotels', label: 'FLIGHTS & HOTELS (4×)', color: '#C8512F', symbol: '$' },
                    { key: 'dining', label: 'DINING (3×)', color: '#C8512F', symbol: '$' },
                    { key: 'otherSpending', label: 'EVERYTHING ELSE (1×)', color: '#C8512F', symbol: '$' }
                  ].map((item, index) => (
                    <div key={item.key} className="relative">
                      <label className="block text-sm font-black text-black mb-3 tracking-wide"
                             style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                        {item.label}
                      </label>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg border-4 border-white"
                             style={{ backgroundColor: item.color }}
                             data-testid="spending-category-circle">
                          {item.symbol}
                        </div>
                        
                        <input
                          type="text"
                          value={inputs[item.key]}
                          onChange={(e) => handleInputChange(item.key, e.target.value)}
                          className="flex-1 p-4 text-2xl font-black text-black border-4 transition-all duration-300 focus:outline-none focus:scale-105"
                          style={{ 
                            backgroundColor: '#F8F6F0',
                            borderColor: '#3D405B',
                            fontFamily: STATIC_STYLES.fontFamily,
                            borderRadius: STATIC_STYLES.borderRadius24
                          }}
                          onFocus={(e) => e.target.style.borderColor = item.color}
                          onBlur={(e) => e.target.style.borderColor = '#3D405B'}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total display */}
                <div className="mt-8 text-white p-6 rounded-3xl" style={{ backgroundColor: '#3D405B' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black" style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                        ${totalAnnualSpending.toLocaleString()}
                      </div>
                      <div className="text-sm font-bold tracking-wide" style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                        TOTAL ANNUAL SPENDING
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white" 
                         style={{ backgroundColor: '#C8512F' }}>
                      <div className="text-white font-black text-xl">$</div>
                    </div>
                  </div>
                  {qualifiesForHighSpender && (
                    <div className="mt-4 text-white p-3 font-black text-sm tracking-wider rounded-2xl" 
                         style={{ backgroundColor: '#C8512F', fontFamily: STATIC_STYLES.fontFamily }}>
                      ✓ HIGH SPENDER QUALIFIED
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* High Spender Benefits */}
            {qualifiesForHighSpender && (
              <div className="relative"
                   style={{ 
                     background: 'linear-gradient(135deg, #C8512F 0%, #B8472A 50%, #C8512F 100%)',
                     borderRadius: STATIC_STYLES.borderRadius32,
                     boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)'
                   }}>
                
                <div className="p-8">
                  <h3 className="text-2xl font-black text-white mb-8 tracking-wide"
                      style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                    HIGH SPENDER BENEFITS
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'useShopsCredit', label: '$250 SHOPS CREDIT', value: '$250' },
                      { key: 'useSouthwestCredit', label: '$500 SOUTHWEST CREDIT', value: '$500' },
                      { key: 'useIHGDiamond', label: 'IHG DIAMOND STATUS', value: '$200' },
                      { key: 'useSouthwestAList', label: 'SOUTHWEST A-LIST', value: '$150' }
                    ].map(benefit => (
                      <div key={benefit.key} 
                           className="flex items-center justify-between p-4 cursor-pointer transition-all duration-300 hover:scale-105 rounded-3xl"
                           style={{ backgroundColor: inputs[benefit.key] ? '#E9C46A' : '#F8F6F0' }}
                           onClick={() => handleInputChange(benefit.key, !inputs[benefit.key])}>
                        <div className="flex items-center">
                          <div className="w-8 h-8 border-4 mr-4 transition-all rounded-lg"
                               style={{ 
                                 borderColor: '#3D405B',
                                 backgroundColor: inputs[benefit.key] ? '#3D405B' : '#F8F6F0'
                               }}>
                            {inputs[benefit.key] && (
                              <div className="w-full h-full scale-50 mt-1 ml-1 rounded-sm" style={{ backgroundColor: '#E9C46A' }}></div>
                            )}
                          </div>
                          <span className="font-black text-black text-sm tracking-wide"
                                style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                            {benefit.label}
                          </span>
                        </div>
                        <span className="font-black text-black text-lg"
                              style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                          {benefit.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Column 2 - Benefits */}
          <div className="space-y-8">
            {/* Travel Benefits */}
            <div className="relative"
                 style={{ 
                   background: 'linear-gradient(135deg, #E07A5F 0%, #D6704B 50%, #E07A5F 100%)',
                   borderRadius: STATIC_STYLES.borderRadius32,
                   boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)'
                 }}>
              
              <div className="p-8">
                <h3 className="text-2xl font-black text-white mb-8 tracking-wide"
                    style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                  TRAVEL BENEFITS
                </h3>
                
                <div className="space-y-6">
                  {[
                    { key: 'travelCreditUsage', label: 'TRAVEL CREDIT', max: 300, placeholder: '300', symbol: '$' },
                    { key: 'diningCredit', label: 'DINING CREDIT', max: 300, placeholder: '300', symbol: '$' },
                    { key: 'editStaysValue', label: 'EDIT STAYS', placeholder: '0', symbol: '$' },
                    { key: 'stubhubSpending', label: 'STUBHUB', placeholder: '0', symbol: '$' },
                    { key: 'priorityPassVisits', label: 'PRIORITY PASS VISITS', placeholder: '0', symbol: '#' }
                  ].map((item, index) => (
                    <div key={item.key}>
                      <label className="block text-sm font-black text-white mb-3 tracking-wide"
                             style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                        {item.label}
                      </label>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-black text-lg border-4 border-white"
                             style={{ backgroundColor: '#E9C46A' }}>
                          {item.symbol}
                        </div>
                        
                        <input
                          type="text"
                          value={inputs[item.key]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            handleInputChange(item.key, item.max ? Math.min(item.max, value) : value);
                          }}
                          className="flex-1 p-4 text-2xl font-black text-black border-4 transition-all duration-300 focus:outline-none focus:scale-105"
                          style={{ 
                            backgroundColor: '#F8F6F0',
                            borderColor: '#3D405B',
                            fontFamily: STATIC_STYLES.fontFamily,
                            borderRadius: STATIC_STYLES.borderRadius24
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#E9C46A'}
                          onBlur={(e) => e.target.style.borderColor = '#3D405B'}
                          placeholder={item.placeholder}
                        />
                      </div>
                      {item.max && <div className="text-xs mt-1 text-white font-bold"
                                        style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                        MAX ${item.max}
                      </div>}
                    </div>
                  ))}
                </div>
                
                {/* Global Entry Checkbox */}
                <div className="mt-8 flex items-center p-4 cursor-pointer transition-all duration-300 hover:scale-105 rounded-3xl"
                     style={{ backgroundColor: inputs.globalEntryValue ? '#E9C46A' : '#F8F6F0' }}
                     onClick={() => handleInputChange('globalEntryValue', !inputs.globalEntryValue)}>
                  <div className="w-8 h-8 border-4 mr-4 rounded-lg"
                       style={{ 
                         borderColor: '#3D405B',
                         backgroundColor: inputs.globalEntryValue ? '#3D405B' : '#F8F6F0'
                       }}>
                    {inputs.globalEntryValue && (
                      <div className="w-full h-full scale-50 mt-1 ml-1 rounded-sm" style={{ backgroundColor: '#E9C46A' }}></div>
                    )}
                  </div>
                  <span className="font-black text-black tracking-wide"
                        style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                    GLOBAL ENTRY CREDIT
                  </span>
                </div>
              </div>
            </div>

            {/* Service Benefits */}
            <div className="relative"
                 style={{ 
                   background: 'linear-gradient(135deg, #3D405B 0%, #2F3142 50%, #3D405B 100%)',
                   borderRadius: STATIC_STYLES.borderRadius32,
                   boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)'
                 }}>
              
              <div className="p-8">
                <h3 className="text-2xl font-black text-white mb-8 tracking-wide"
                    style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                  SERVICES
                </h3>
                
                <div className="space-y-6">
                  {[
                    { key: 'dashpassUsage', label: 'DASHPASS MONTHS', max: 12, placeholder: '12', symbol: '#' },
                    { key: 'lyftRides', label: 'LYFT RIDES/MONTH', placeholder: '0', symbol: '#' },
                    { key: 'pelotonEquipment', label: 'PELOTON EQUIPMENT', placeholder: '0', symbol: '$' }
                  ].map(item => (
                    <div key={item.key}>
                      <label className="block text-sm font-black text-white mb-3 tracking-wide"
                             style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                        {item.label}
                      </label>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg border-4 border-white"
                             style={{ backgroundColor: '#C8512F' }}>
                          {item.symbol}
                        </div>
                        
                        <input
                          type="text"
                          value={inputs[item.key]}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            handleInputChange(item.key, item.max ? Math.min(item.max, value) : value);
                          }}
                          className="flex-1 p-4 text-2xl font-black text-black border-4 transition-all duration-300 focus:outline-none focus:scale-105"
                          style={{ 
                            backgroundColor: '#F8F6F0',
                            borderColor: '#F8F6F0',
                            fontFamily: STATIC_STYLES.fontFamily,
                            borderRadius: STATIC_STYLES.borderRadius24
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#E9C46A'}
                          onBlur={(e) => e.target.style.borderColor = '#F8F6F0'}
                          placeholder={item.placeholder}
                        />
                      </div>
                      {item.max && <div className="text-xs mt-1 text-white font-bold"
                                        style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                        MAX {item.max}
                      </div>}
                    </div>
                  ))}
                </div>
                
                {/* Service checkboxes */}
                <div className="mt-8 space-y-3">
                  {[
                    { key: 'restaurantOrders', label: '$5 DOORDASH RESTAURANT CREDIT', period: 'monthly' },
                    { key: 'nonRestaurantOrders', label: '$20 DOORDASH NON-RESTAURANT CREDIT', period: 'monthly' },
                    { key: 'pelotonMembership', label: '$120 PELOTON MEMBERSHIP', period: 'annual' },
                    { key: 'appleServices', label: '$215 APPLE SERVICES', period: 'annual' }
                  ].map(service => (
                    <div key={service.key} 
                         className="flex items-center justify-between p-4 cursor-pointer transition-all duration-300 hover:scale-105 rounded-3xl"
                         style={{ backgroundColor: inputs[service.key] ? '#E9C46A' : '#F8F6F0' }}
                         onClick={() => handleInputChange(service.key, !inputs[service.key])}>
                      <div className="flex items-center">
                        <div className="w-8 h-8 border-4 mr-4 rounded-lg"
                             style={{ 
                               borderColor: '#3D405B',
                               backgroundColor: inputs[service.key] ? '#3D405B' : '#F8F6F0'
                             }}>
                          {inputs[service.key] && (
                            <div className="w-full h-full scale-50 mt-1 ml-1 rounded-sm" style={{ backgroundColor: '#E9C46A' }}></div>
                          )}
                        </div>
                        <div>
                          <span className="font-black text-black text-sm tracking-wide block"
                                style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                            {service.label}
                          </span>
                          <span className="text-xs text-black font-bold opacity-75"
                                style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                            {service.period}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="space-y-8">
            {/* ROI Analysis */}
            <div className="relative"
                 style={{ 
                   background: 'linear-gradient(135deg, #3D405B 0%, #2F3142 50%, #3D405B 100%)',
                   borderRadius: STATIC_STYLES.borderRadius32,
                   boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)'
                 }}>
              
              <div className="p-8">
                <h3 className="text-2xl font-black text-white mb-8 text-center tracking-wide"
                    style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                  ROI ANALYSIS
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b-4 border-white rounded-lg">
                    <span className="text-white font-bold tracking-wide"
                          style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                      ANNUAL FEE
                    </span>
                    <span className="text-2xl font-black text-white"
                          style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                      -$795
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b-4 border-white rounded-lg">
                    <span className="text-white font-bold tracking-wide"
                          style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                      BENEFIT VALUE
                    </span>
                    <span className="text-2xl font-black text-white"
                          style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                      ${results.totalValue.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b-4 rounded-lg" 
                       style={{ borderColor: '#E9C46A' }}>
                    <span className="text-white font-bold tracking-wide"
                          style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                      NET VALUE
                    </span>
                    <span className="text-2xl font-black"
                          style={{ 
                            color: results.totalValue - 795 > 0 ? '#E9C46A' : '#E07A5F',
                            fontFamily: STATIC_STYLES.fontFamily
                          }}>
                      ${(results.totalValue - 795).toFixed(0)}
                    </span>
                  </div>
                </div>
                
                {/* ROI Display */}
                <div className="text-center p-8 rounded-3xl" style={{ backgroundColor: '#E9C46A' }}>
                  <div className="text-black font-black text-sm tracking-wider mb-2"
                       style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                    RETURN ON INVESTMENT
                  </div>
                  <div className="text-6xl font-black text-black mb-2"
                       style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                    {results.roi.toFixed(1)}%
                  </div>
                  <div className="text-xs text-black font-bold"
                       style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                    RANGE: {results.minROI.toFixed(1)}% TO {results.maxROI.toFixed(1)}%
                  </div>
                  
                  {/* Geometric accent */}
                  <div className="mt-4 flex justify-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3D405B' }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C8512F' }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3D405B' }}></div>
                  </div>
                </div>
                
                {/* Ko-fi Support Button - Bright and Prominent */}
                <div className="mt-6 p-5 rounded-2xl text-center border-4 border-white" 
                     style={{ 
                       background: 'linear-gradient(135deg, #E07A5F 0%, #D6704B 50%, #E07A5F 100%)'
                     }}>
                  <div className="text-white font-black text-lg mb-3 tracking-wider"
                       style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                    SUPPORT VALORETTI
                  </div>
                  <div className="text-xs text-white font-bold mb-3"
                       style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                    If this saved you time or effort, consider giving back ❤️
                  </div>
                  
                  {/* Ko-fi Button Container */}
                  <div className="flex justify-center">
                    <div id="kofi-widget" className="ko-fi-button-container">
                      {/* Ko-fi widget will be inserted here */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit Breakdown */}
            <div className="border-8 rounded-3xl" style={{ backgroundColor: '#F8F6F0', borderColor: '#3D405B' }}>
              <div className="p-4" style={{ backgroundColor: '#E9C46A', borderRadius: '16px 16px 0 0' }}>
                <h3 className="text-2xl font-black text-black text-center tracking-wide"
                    style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                  BREAKDOWN
                </h3>
              </div>
              
              <div className="p-6 space-y-3">
                {Object.entries(results.breakdown).map(([key, benefit], index) => (
                  <div key={key} className="p-4 border-4 rounded-2xl"
                       style={{ 
                         borderColor: key === 'highSpender' ? '#C8512F' : '#3D405B',
                         backgroundColor: key === 'highSpender' ? '#C8512F' : '#F8F6F0'
                       }}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center flex-1">
                        <div className="w-6 h-6 mr-4 rounded-full"
                             style={{ 
                               backgroundColor: key === 'highSpender' ? '#E9C46A' : 
                                              index % 3 === 0 ? '#E9C46A' : 
                                              index % 3 === 1 ? '#C8512F' : '#E07A5F'
                             }}></div>
                        <div>
                          <div className={`font-black text-sm tracking-wide ${key === 'highSpender' ? 'text-white' : 'text-black'}`}
                               style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                            {key === 'highSpender' ? 'HIGH SPENDER' : key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                          </div>
                          <div className={`text-xs mt-1 ${key === 'highSpender' ? 'text-white' : 'text-black'}`}
                               style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                            {benefit.details}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`font-black text-lg ${key === 'highSpender' ? 'text-white' : 'text-black'}`}
                             style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                          ${benefit.value.toFixed(0)}
                        </div>
                        <div className={`text-xs ${key === 'highSpender' ? 'text-white' : 'text-black'}`}
                             style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                          ${benefit.min.toFixed(0)}-${benefit.max.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-8 text-center border-8 rounded-3xl"
                 style={{ 
                   backgroundColor: results.roi > 0 ? '#E9C46A' : '#C8512F',
                   borderColor: '#3D405B'
                 }}>
              <div className="text-4xl font-black text-black mb-4 tracking-wide"
                   style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                {results.roi > 0 ? 'RECOMMENDED' : 'NOT RECOMMENDED'}
              </div>
              <div className={`text-lg font-black mb-2 tracking-wide ${results.roi > 0 ? 'text-black' : 'text-white'}`}
                   style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                {results.roi > 0 ? 'POSITIVE ROI: KEEP THE CARD' : 'NEGATIVE ROI: CONSIDER ALTERNATIVES'}
              </div>
              <div className={`text-sm font-bold ${results.roi > 0 ? 'text-black' : 'text-white'}`}
                   style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                NET {results.roi > 0 ? 'BENEFIT' : 'LOSS'}: ${Math.abs(results.totalValue - 795).toFixed(0)}
              </div>
              
              {/* Geometric pattern */}
              <div className="mt-6 flex justify-center space-x-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-2 h-8 rounded-full"
                       style={{ 
                         backgroundColor: i % 2 === 0 ? '#3D405B' : 
                                         results.roi > 0 ? '#3D405B' : '#E9C46A'
                       }}></div>
                ))}
              </div>
            </div>

            {/* Ko-fi Support Button - Under Recommendation */}
            <div className="p-5 rounded-2xl text-center border-4 border-white" 
                 style={{ 
                   background: 'linear-gradient(135deg, #E07A5F 0%, #D6704B 50%, #E07A5F 100%)'
                 }}>
              <div className="text-white font-black text-lg mb-3 tracking-wider"
                   style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                SUPPORT VALORETTI
              </div>
              <div className="text-xs text-white font-bold mb-3"
                   style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                If this saved you time or effort, consider giving back ❤️
              </div>
              
              {/* Ko-fi Button Container */}
              <div className="flex justify-center">
                <div id="kofi-widget-2" className="ko-fi-button-container">
                  {/* Second Ko-fi widget will be inserted here */}
                </div>
              </div>
            </div>

            {/* Analysis Notes */}
            <div className="p-6 border-4 rounded-3xl relative" style={{ backgroundColor: '#3D405B', borderColor: '#E9C46A' }}>
              <h4 className="font-black mb-4 text-white text-lg tracking-wide"
                  style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                NOTES
              </h4>
              <div className="text-sm space-y-2 text-white font-bold"
                   style={{ fontFamily: STATIC_STYLES.fontFamily }}>
                <div>• EXISTING CARDHOLDERS ONLY</div>
                <div>• POINT VALUES: 1.5-2.0¢ VIA CHASE TRAVEL</div>
                <div>• HIGH SPENDER: $75K+ ANNUAL SPENDING</div>
                <div>• ACTUAL VALUE VARIES BY USAGE</div>
              </div>
              
              {/* Corner accent */}
              <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full" style={{ backgroundColor: '#E9C46A' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SapphireReserveROICalculator;