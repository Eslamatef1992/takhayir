// Kuwait's 6 governorates ("City" in our address form) mapped to their
// common residential/commercial areas ("Area"). Used to drive the
// City/Area dropdowns on the address forms instead of free text, since
// every Takhayir shipment is within Kuwait.

export const KUWAIT_GOVERNORATES = [
  'Al Asimah (Capital)',
  'Hawalli',
  'Farwaniya',
  'Mubarak Al-Kabeer',
  'Ahmadi',
  'Jahra'
] as const;

export const KUWAIT_AREAS: Record<string, string[]> = {
  'Al Asimah (Capital)': [
    'Kuwait City',
    'Sharq',
    'Mirqab',
    'Qibla',
    'Dasman',
    'Bneid Al Gar',
    'Shuwaikh',
    'Shuwaikh Industrial',
    'Shamiya',
    'Kaifan',
    'Faiha',
    'Nuzha',
    'Adailiya',
    'Qadsiya',
    'Yarmouk',
    'Rawda',
    'Qurtuba',
    'Surra',
    'Khaldiya',
    'Daiya',
    'Mansouriya',
    'Sulaibikhat',
    'Doha',
    'Granada',
    'Shuwaikh Port'
  ],
  Hawalli: [
    'Hawalli',
    'Salmiya',
    'Salwa',
    'Bayan',
    'Mishref',
    'Rumaithiya',
    'Jabriya',
    'Shaab',
    'Shuhada',
    'Mubarak Al-Abdullah',
    'Zahra',
    'Hitteen',
    'Siddiq',
    'Bidaa',
    'Maidan Hawalli'
  ],
  Farwaniya: [
    'Farwaniya',
    'Khaitan',
    'Jleeb Al-Shuyoukh',
    'Andalous',
    'Ardiya',
    'Omariya',
    'Rai',
    'Rabiya',
    'Riggae',
    'Sabah Al Nasser',
    'Abdullah Al Mubarak',
    'Ferdous',
    'Ishbiliya',
    'Dajeej',
    'Abraq Khaitan',
    'South Surra'
  ],
  'Mubarak Al-Kabeer': [
    'Mubarak Al-Kabeer',
    'Qurain',
    'Qusour',
    'Adan',
    'Sabah Al-Salem',
    'Fnaitees',
    'Messila',
    'Abu Al Hasaniya',
    'Abu Fatira'
  ],
  Ahmadi: [
    'Ahmadi',
    'Fahaheel',
    'Mangaf',
    'Abu Halifa',
    'Fintas',
    'Mahboula',
    'Riqqa',
    'Sabahiya',
    'Ali Sabah Al-Salem',
    'Wafra',
    'Julaia',
    'Zour',
    'Shuaiba',
    'Egaila',
    'Hadiya',
    'Dhaher',
    'Nuwaiseeb'
  ],
  Jahra: [
    'Jahra',
    'Naeem',
    'Qasr',
    'Saad Al Abdullah',
    'Waha',
    'Sulaibiya',
    'Taima',
    'Abdali',
    'Salmi',
    'Nasseem',
    'Oyoun'
  ]
};
