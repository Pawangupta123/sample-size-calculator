import type { ProtocolFormData, StudyType } from './types'

// ─── Study type labels ─────────────────────────────────────────────────────────

export const STUDY_TYPE_LABELS: Record<StudyType, string> = {
  rct: 'Randomised Controlled Trial (RCT)',
  prospective_cohort: 'Prospective Cohort Study',
  retrospective_cohort: 'Retrospective Cohort Study',
  cross_sectional: 'Cross-sectional Study',
  case_control: 'Case-control Study',
  descriptive: 'Descriptive Study',
  diagnostic_accuracy: 'Diagnostic Accuracy Study',
}

// ─── Introduction template ─────────────────────────────────────────────────────

export function getIntroductionTemplate(d: ProtocolFormData): string[] {
  return [
    `${d.condition} is a significant clinical entity associated with considerable morbidity and mortality worldwide. It represents a major public health challenge, particularly in developing countries like India, where limited healthcare resources compound the burden of disease.`,
    `Globally, ${d.condition} affects millions of individuals annually, with substantial variation in incidence and outcomes across different regions and populations. In the Indian subcontinent, studies have reported a high prevalence of ${d.condition}, often presenting with unique epidemiological and clinical characteristics that may differ from those described in Western literature. [Reference required]`,
    `${d.intervention ? `The role of ${d.intervention} in the management of ${d.condition} has been a subject of considerable research interest. Previous studies have demonstrated variable outcomes, and there remains a need for well-designed trials to establish evidence-based treatment protocols. [Reference required]` : `Current management strategies for ${d.condition} vary widely across institutions, and evidence-based guidelines specific to the Indian population remain limited. [Reference required]`}`,
    `Despite advances in understanding the pathophysiology of ${d.condition}, several aspects of its ${d.intervention ? 'treatment' : 'epidemiology and management'} remain poorly understood. The primary outcome of interest — ${d.primaryOutcome} — has not been adequately studied in our patient population, limiting the applicability of existing evidence to our clinical practice.`,
    `Therefore, the present study has been designed to evaluate ${d.primaryOutcome} in patients with ${d.condition}${d.intervention ? ` receiving ${d.intervention}` : ''} at ${d.setting || d.institution}. The findings of this study are expected to contribute to the growing body of evidence and guide clinical decision-making in the management of ${d.condition} in the Indian context.`,
  ]
}

// ─── Methodology templates by study type ──────────────────────────────────────

export function getStudyDesignTemplate(d: ProtocolFormData): string[] {
  const designs: Record<StudyType, string[]> = {
    rct: [
      `This will be a prospective, randomised, controlled trial conducted at ${d.setting || d.institution}.`,
      `Eligible participants will be randomised in a 1:1 ratio into two groups: (Group A) ${d.intervention} and (Group B) standard of care/placebo. Randomisation will be performed using computer-generated random numbers with block randomisation (block size of 4 and 6, randomly varied). Allocation concealment will be maintained using sealed opaque envelopes.`,
      `Blinding: The study will be ${d.additionalInfo?.toLowerCase().includes('double') ? 'double' : 'single'}-blind wherever feasible. Outcome assessors will be blinded to group allocation throughout the study period.`,
      `The trial will be conducted in accordance with the Declaration of Helsinki, CONSORT guidelines, and the Indian Council of Medical Research (ICMR) National Ethical Guidelines for Biomedical and Health Research (2017).`,
    ],
    prospective_cohort: [
      `This will be a prospective cohort study conducted at ${d.setting || d.institution}.`,
      `Participants meeting the eligibility criteria will be enrolled and followed prospectively over the study duration. Exposure status will be assessed at baseline, and participants will be followed for the development of the primary outcome.`,
      `The study will adhere to the STROBE (Strengthening the Reporting of Observational Studies in Epidemiology) guidelines.`,
    ],
    retrospective_cohort: [
      `This will be a retrospective cohort study based on medical records review at ${d.setting || d.institution}.`,
      `Case records of patients with ${d.condition} admitted/treated during the study period will be retrieved and reviewed. Exposure and outcome data will be extracted using a pre-designed data extraction form.`,
      `The study will adhere to STROBE guidelines.`,
    ],
    cross_sectional: [
      `This will be a descriptive cross-sectional study conducted at ${d.setting || d.institution}.`,
      `A representative sample of ${d.population} will be enrolled using ${d.sampleSize ? 'systematic random sampling' : 'convenience sampling'} technique. Data will be collected at a single time point using a pre-validated, semi-structured questionnaire and clinical examination.`,
      `The study will adhere to STROBE guidelines for observational studies.`,
    ],
    case_control: [
      `This will be a hospital-based case-control study conducted at ${d.setting || d.institution}.`,
      `Cases: ${d.population} diagnosed with ${d.condition} based on [define diagnostic criteria].`,
      `Controls: Age- and sex-matched individuals without ${d.condition}, selected from the same hospital population in a 1:2 ratio.`,
      `Exposure data will be collected for both cases and controls using a pre-designed, interviewer-administered questionnaire and review of medical records.`,
    ],
    descriptive: [
      `This will be a hospital-based descriptive observational study conducted at ${d.setting || d.institution}.`,
      `The study aims to describe the clinical profile, presentation, and outcome of ${d.condition} in ${d.population}.`,
      `Data will be collected using a pre-designed, structured proforma upon enrolment and at defined follow-up intervals.`,
    ],
    diagnostic_accuracy: [
      `This will be a prospective study evaluating the diagnostic accuracy of ${d.intervention} for the detection of ${d.condition} at ${d.setting || d.institution}.`,
      `The index test (${d.intervention}) will be compared against the reference standard ([specify gold standard]) in all enrolled participants. Both the index test and reference standard will be performed and interpreted independently and without knowledge of each other's results.`,
      `The study will adhere to the STARD (Standards for Reporting Diagnostic Accuracy Studies) guidelines.`,
    ],
  }
  return designs[d.studyType] ?? designs.descriptive
}

export function getSampleSizeTemplate(d: ProtocolFormData): string[] {
  const formulas: Record<StudyType, string[]> = {
    rct: [
      `Sample size was calculated using the formula for comparison of two proportions (Fleiss, 1981):`,
      `n = [Z(α/2) + Z(β)]² × [p₁(1−p₁) + p₂(1−p₂)] / (p₁ − p₂)²`,
      `Assumptions:`,
      `  • Level of significance (α) = 0.05 (two-tailed); Z(α/2) = 1.96`,
      `  • Power (1−β) = 80%; Z(β) = 0.842`,
      `  • Expected proportion in control group (p₂) = [based on prior literature]`,
      `  • Expected proportion in intervention group (p₁) = [estimated effect size]`,
      `  • Expected drop-out rate = 10–15%`,
      d.sampleSize
        ? `Based on these assumptions, the calculated sample size is ${d.sampleSize} per group (total N = ${parseInt(d.sampleSize) * 2}), with a 10% addition for drop-outs.`
        : `The calculated sample size will be [n] per group (total N = [2n]), with a 10% addition for anticipated drop-outs.`,
    ],
    cross_sectional: [
      `Sample size was calculated using the formula for a single proportion (Daniel, 1999):`,
      `n = Z² × p × (1−p) / d²`,
      `Assumptions:`,
      `  • Z = 1.96 (for 95% confidence level)`,
      `  • p = [expected prevalence from prior studies]`,
      `  • d = [acceptable margin of error, typically 5–10%]`,
      `  • Non-response rate = 10%`,
      d.sampleSize
        ? `The minimum required sample size is ${d.sampleSize}.`
        : `The minimum required sample size is [n].`,
    ],
    case_control: [
      `Sample size was calculated using the formula for a case-control study (Kelsey et al., 1996):`,
      `n = [Z(α/2) + Z(β)]² × [p₁(1−p₁)/r + p₂(1−p₂)] / (p₁ − p₂)²`,
      `  • r = ratio of controls to cases = 2:1`,
      `  • OR = expected odds ratio = [from prior literature]`,
      `  • p₂ = proportion of controls exposed = [from prior literature]`,
      d.sampleSize
        ? `The minimum required number of cases = ${d.sampleSize} (controls = ${parseInt(d.sampleSize) * 2}).`
        : `The minimum required number of cases = [n] (controls = [2n]).`,
    ],
    prospective_cohort: [
      `Sample size was calculated based on the expected incidence rate of ${d.primaryOutcome}:`,
      `n = [Z(α/2) + Z(β)]² × (p₁q₁/n₁ + p₂q₂/n₂) / (p₁ − p₂)²`,
      `  • Incidence in exposed group (p₁) = [from literature]`,
      `  • Incidence in unexposed group (p₂) = [from literature]`,
      `  • Follow-up period = ${d.duration}`,
      d.sampleSize
        ? `Minimum sample size: ${d.sampleSize} per group.`
        : `Minimum sample size: [n] per group.`,
    ],
    retrospective_cohort: [
      `Sample size was estimated based on available case records during the study period and the expected event rate of ${d.primaryOutcome}.`,
      d.sampleSize ? `Minimum required sample: ${d.sampleSize}.` : `Minimum required sample: [n].`,
    ],
    descriptive: [
      `Sample size was calculated using the formula: n = Z² × p × (1−p) / d²`,
      `  • Z = 1.96, p = [prevalence from prior studies], d = [margin of error]`,
      d.sampleSize ? `Minimum sample size: ${d.sampleSize}.` : `Minimum sample size: [n].`,
    ],
    diagnostic_accuracy: [
      `Sample size was calculated using the formula based on expected sensitivity and specificity (Buderer, 1996):`,
      `  • Expected sensitivity = [from literature], specificity = [from literature]`,
      `  • Precision = 0.05, confidence level = 95%`,
      d.sampleSize ? `Minimum sample size: ${d.sampleSize}.` : `Minimum sample size: [n].`,
    ],
  }
  return formulas[d.studyType] ?? formulas.descriptive
}

export function getStatisticsTemplate(d: ProtocolFormData): string[] {
  const stats: Record<StudyType, string[]> = {
    rct: [
      `Data will be entered in Microsoft Excel and analysed using SPSS version 26.0 (IBM Corp., Armonk, NY) or Stata version 17.0.`,
      `Descriptive statistics: Continuous variables will be expressed as mean ± standard deviation (SD) or median with interquartile range (IQR), as appropriate. Categorical variables will be expressed as proportions and percentages.`,
      `Inferential statistics:`,
      `  • Categorical variables: Chi-square test or Fisher's exact test`,
      `  • Continuous variables with normal distribution: Independent samples t-test`,
      `  • Non-normally distributed continuous variables: Mann-Whitney U test`,
      `  • Time-to-event analysis: Kaplan-Meier survival curves; log-rank test`,
      `  • Multivariable analysis: Binary logistic regression / Cox proportional hazards regression for identifying independent predictors`,
      `Analysis will be performed on an intention-to-treat (ITT) basis. Per-protocol analysis will be performed as a sensitivity analysis.`,
      `A p-value < 0.05 will be considered statistically significant. All tests will be two-tailed. 95% confidence intervals will be reported.`,
      `Interim analysis: An interim analysis for safety will be performed after 50% enrolment.`,
    ],
    prospective_cohort: [
      `Data will be analysed using SPSS version 26.0 or R version 4.3.`,
      `Relative risk (RR) with 95% CI will be the primary measure of association.`,
      `Kaplan-Meier method for time-to-event analysis; log-rank test for group comparison.`,
      `Cox proportional hazards regression for multivariable analysis, adjusting for confounders.`,
      `p < 0.05 will be considered statistically significant.`,
    ],
    cross_sectional: [
      `Data will be analysed using SPSS version 26.0.`,
      `Descriptive statistics: frequencies, proportions, mean ± SD.`,
      `Association between categorical variables: Chi-square / Fisher's exact test.`,
      `Strength of association: Prevalence ratio with 95% CI.`,
      `Multiple logistic regression for identifying independent determinants.`,
      `p < 0.05 will be considered statistically significant.`,
    ],
    case_control: [
      `Data will be analysed using SPSS version 26.0.`,
      `Odds ratio (OR) with 95% CI will be the primary measure of association.`,
      `Chi-square / Fisher's exact test for categorical variables.`,
      `Conditional logistic regression for multivariable analysis.`,
      `p < 0.05 will be considered statistically significant.`,
    ],
    retrospective_cohort: [
      `Data will be analysed using SPSS version 26.0.`,
      `Descriptive statistics, relative risk, Kaplan-Meier analysis, Cox regression.`,
      `p < 0.05 will be considered statistically significant.`,
    ],
    descriptive: [
      `Data will be analysed using SPSS version 26.0.`,
      `Frequencies, proportions, mean ± SD for continuous variables.`,
      `Chi-square test for associations between categorical variables.`,
      `p < 0.05 will be considered statistically significant.`,
    ],
    diagnostic_accuracy: [
      `Data will be analysed using SPSS version 26.0 or MedCalc software.`,
      `Sensitivity, specificity, positive predictive value (PPV), negative predictive value (NPV) with 95% CI (Wilson score method).`,
      `Receiver Operating Characteristic (ROC) curve analysis; area under the curve (AUC) reported.`,
      `Optimal cut-off determined by Youden's index.`,
      `Agreement between index test and reference standard: Cohen's kappa coefficient.`,
    ],
  }
  return stats[d.studyType] ?? stats.descriptive
}

// ─── Consent form templates ────────────────────────────────────────────────────

export function getConsentFormEnglish(d: ProtocolFormData): string[] {
  return [
    `INFORMED CONSENT FORM`,
    ``,
    `Study Title: ${d.title}`,
    `Principal Investigator: ${d.investigatorName || '[Name of Principal Investigator]'}`,
    `Department: ${d.department}`,
    `Institution: ${d.institution || '[Name of Institution]'}`,
    `Guide/Supervisor: ${d.guideName || '[Name of Guide]'}`,
    ``,
    `PATIENT INFORMATION SHEET`,
    ``,
    `You are being invited to take part in a research study. Before you decide to participate, it is important for you to understand why the research is being done and what it will involve. Please read the following information carefully and discuss it with others if you wish. Ask us if there is anything that is not clear or if you would like more information. Take your time to decide whether or not you wish to take part.`,
    ``,
    `1. WHAT IS THE PURPOSE OF THIS STUDY?`,
    `This study is being conducted to ${d.primaryOutcome ? `evaluate ${d.primaryOutcome} in patients with ${d.condition}` : `study ${d.condition}`}. The information gathered from this study may help in improving the care and treatment of future patients with similar conditions.`,
    ``,
    `2. WHY HAVE YOU BEEN CHOSEN?`,
    `You have been invited to participate because you have been diagnosed with ${d.condition || '[the condition being studied]'} and you meet the criteria for participation in this study.`,
    ``,
    `3. DO YOU HAVE TO TAKE PART?`,
    `Participation in this study is entirely voluntary. You are free to decide whether or not to participate. If you decide to participate, you may withdraw at any time and without giving any reason. Your decision will not affect the standard of care you receive.`,
    ``,
    `4. WHAT WILL HAPPEN IF YOU TAKE PART?`,
    `If you agree to participate:`,
    `  • Your medical history, symptoms, and examination findings will be recorded.`,
    `  • You will undergo relevant blood/laboratory/radiological investigations as required for the study.`,
    `  • ${d.intervention ? `You may receive ${d.intervention} as part of the study protocol.` : 'You will be followed up as per the study protocol.'}`,
    `  • The study will last approximately ${d.duration || '[duration]'}.`,
    ``,
    `5. POSSIBLE RISKS AND DISCOMFORTS`,
    `The risks associated with this study are minimal. Any blood sample collection will be done by a trained professional following standard aseptic precautions. You will be informed of any significant new information discovered during the study that may affect your willingness to continue participation.`,
    ``,
    `6. POSSIBLE BENEFITS`,
    `You may or may not benefit directly from participating in this study. However, the information obtained may benefit other patients with similar conditions in the future.`,
    ``,
    `7. CONFIDENTIALITY`,
    `All information collected about you will be kept strictly confidential. Your identity will not be disclosed in any publication or report arising from this study. Data will be stored securely and will be accessible only to the research team.`,
    ``,
    `8. CONTACT INFORMATION`,
    `If you have any questions about this study or your participation, please contact:`,
    `  Dr. ${d.investigatorName || '[Investigator Name]'}, Department of ${d.department}`,
    `  ${d.institution || '[Institution Name]'}`,
    `  Tel: [Phone Number] | Email: [Email Address]`,
    ``,
    `For concerns about your rights as a research participant, you may also contact the Institutional Ethics Committee.`,
    ``,
    `─────────────────────────────────────────────────`,
    `CONSENT DECLARATION`,
    `─────────────────────────────────────────────────`,
    ``,
    `I, _________________________________, confirm that:`,
    `  ☐ I have read (or have had read to me) the above information.`,
    `  ☐ I have had the opportunity to ask questions.`,
    `  ☐ I understand that my participation is voluntary and I may withdraw at any time.`,
    `  ☐ I agree to take part in the above study.`,
    ``,
    `Name of Participant: _________________________________ Date: ___________`,
    `Signature / Left Thumb Impression: _________________________________`,
    ``,
    `Name of Witness: _________________________________ Date: ___________`,
    `Signature of Witness: _________________________________`,
    ``,
    `Name of Investigator: _________________________________ Date: ___________`,
    `Signature of Investigator: _________________________________`,
  ]
}

export function getConsentFormHindi(d: ProtocolFormData): string[] {
  return [
    `सूचित सहमति प्रपत्र`,
    `(Informed Consent Form)`,
    ``,
    `अध्ययन का शीर्षक: ${d.title}`,
    `मुख्य अन्वेषक: ${d.investigatorName || '[मुख्य अन्वेषक का नाम]'}`,
    `विभाग: ${d.department}`,
    `संस्थान: ${d.institution || '[संस्थान का नाम]'}`,
    ``,
    `रोगी सूचना पत्र`,
    ``,
    `आपको इस शोध अध्ययन में भाग लेने के लिए आमंत्रित किया जा रहा है। भाग लेने का निर्णय लेने से पहले, यह समझना महत्वपूर्ण है कि यह शोध क्यों किया जा रहा है और इसमें क्या शामिल होगा। कृपया निम्नलिखित जानकारी ध्यानपूर्वक पढ़ें।`,
    ``,
    `1. इस अध्ययन का उद्देश्य क्या है?`,
    `यह अध्ययन ${d.condition || '[रोग/स्थिति]'} से पीड़ित रोगियों में ${d.primaryOutcome || 'उपचार के परिणामों'} का मूल्यांकन करने के लिए किया जा रहा है। इस अध्ययन से प्राप्त जानकारी भविष्य में रोगियों की देखभाल में सुधार करने में सहायक हो सकती है।`,
    ``,
    `2. आपको क्यों चुना गया है?`,
    `आपको इस अध्ययन में इसलिए आमंत्रित किया गया है क्योंकि आपको ${d.condition || '[रोग]'} का निदान किया गया है और आप अध्ययन के मानदंडों को पूरा करते हैं।`,
    ``,
    `3. क्या आपको भाग लेना आवश्यक है?`,
    `इस अध्ययन में भागीदारी पूर्णतः स्वैच्छिक है। आप बिना किसी कारण बताए किसी भी समय अध्ययन से हट सकते हैं। इससे आपको मिलने वाली चिकित्सा सुविधाओं पर कोई प्रभाव नहीं पड़ेगा।`,
    ``,
    `4. यदि आप भाग लेते हैं तो क्या होगा?`,
    `यदि आप सहमत होते हैं, तो:`,
    `  • आपका चिकित्सीय इतिहास, लक्षण और जाँच का परिणाम दर्ज किया जाएगा।`,
    `  • आवश्यक रक्त/प्रयोगशाला/रेडियोलॉजिकल जाँचें की जाएंगी।`,
    `  • ${d.intervention ? `आपको अध्ययन प्रोटोकॉल के अनुसार ${d.intervention} दी जा सकती है।` : 'अध्ययन प्रोटोकॉल के अनुसार आपका अनुवर्ती किया जाएगा।'}`,
    `  • यह अध्ययन लगभग ${d.duration || '[अवधि]'} तक चलेगा।`,
    ``,
    `5. संभावित जोखिम और असुविधा`,
    `इस अध्ययन से जुड़े जोखिम न्यूनतम हैं। रक्त नमूना लेना प्रशिक्षित कर्मचारी द्वारा स्वच्छ परिस्थितियों में किया जाएगा। अध्ययन के दौरान मिली कोई भी महत्वपूर्ण नई जानकारी आपके साथ साझा की जाएगी।`,
    ``,
    `6. संभावित लाभ`,
    `हो सकता है कि आपको इस अध्ययन से प्रत्यक्ष लाभ न हो। लेकिन यह जानकारी भविष्य में अन्य रोगियों के उपचार में सहायक होगी।`,
    ``,
    `7. गोपनीयता`,
    `आपकी सभी जानकारी पूर्णतः गोपनीय रखी जाएगी। किसी भी प्रकाशन में आपकी पहचान उजागर नहीं की जाएगी।`,
    ``,
    `8. संपर्क जानकारी`,
    `किसी भी प्रश्न के लिए संपर्क करें:`,
    `  डॉ. ${d.investigatorName || '[अन्वेषक का नाम]'}, ${d.department} विभाग`,
    `  ${d.institution || '[संस्थान का नाम]'}`,
    `  दूरभाष: [फोन नंबर]`,
    ``,
    `─────────────────────────────────────────────────`,
    `सहमति घोषणा`,
    `─────────────────────────────────────────────────`,
    ``,
    `मैं, _____________________________, पुष्टि करता/करती हूँ कि:`,
    `  ☐ मैंने उपरोक्त जानकारी पढ़ी/सुनी है।`,
    `  ☐ मुझे प्रश्न पूछने का अवसर मिला।`,
    `  ☐ मैं समझता/समझती हूँ कि भागीदारी स्वैच्छिक है।`,
    `  ☐ मैं इस अध्ययन में भाग लेने के लिए सहमत हूँ।`,
    ``,
    `प्रतिभागी का नाम: _____________________________ दिनांक: __________`,
    `हस्ताक्षर / बाएँ अंगूठे का निशान: _____________________________`,
    ``,
    `साक्षी का नाम: _____________________________ दिनांक: __________`,
    `साक्षी का हस्ताक्षर: _____________________________`,
    ``,
    `अन्वेषक का नाम: _____________________________ दिनांक: __________`,
    `अन्वेषक का हस्ताक्षर: _____________________________`,
  ]
}

// ─── Data collection form template ────────────────────────────────────────────

export function getDataCollectionForm(d: ProtocolFormData): string[] {
  const common = [
    `DATA COLLECTION FORM`,
    ``,
    `Study Title: ${d.title}`,
    `Department: ${d.department} | Institution: ${d.institution || '_______________'}`,
    ``,
    `SECTION A: PATIENT IDENTIFICATION`,
    `  Serial No.: __________ | Case No.: __________`,
    `  Date of Enrolment: __________ | Date of Discharge/Last Follow-up: __________`,
    `  Ward/OPD/Bed No.: __________`,
    ``,
    `SECTION B: DEMOGRAPHIC DETAILS`,
    `  Name (initials): __________ | Age: __ years __ months | Sex: ☐ Male  ☐ Female  ☐ Other`,
    `  Address: __________________________ | Phone: ______________`,
    `  Education: ☐ Illiterate  ☐ Primary  ☐ Secondary  ☐ Graduate  ☐ Post-graduate`,
    `  Occupation: ______________ | Socioeconomic status (Modified Kuppuswamy): __`,
    `  Religion: ______________ | Marital status: ☐ Married  ☐ Unmarried  ☐ Widowed`,
    ``,
    `SECTION C: CLINICAL HISTORY`,
    `  Chief complaints:  1. ______________ since __  2. ______________ since __  3. ______________ since __`,
    `  History of present illness: _____________________________________`,
    `  Past medical history: ☐ Diabetes  ☐ Hypertension  ☐ TB  ☐ Bronchial Asthma  ☐ Other: ___`,
    `  Past surgical history: ______________ | Drug history: ______________`,
    `  Family history: ______________ | Personal history: Smoker ☐Y ☐N | Alcoholic ☐Y ☐N`,
    `  Allergy: ______________`,
    ``,
    `SECTION D: EXAMINATION FINDINGS`,
    `  General condition: ☐ Well  ☐ Mildly ill  ☐ Moderately ill  ☐ Critically ill`,
    `  Pulse: ___/min | BP: ___/___ mmHg | Temperature: ___°F/°C | SpO₂: ___%`,
    `  Respiratory rate: ___/min | Weight: ___kg | Height: ___cm | BMI: ___kg/m²`,
    `  Pallor: ☐Y ☐N | Icterus: ☐Y ☐N | Cyanosis: ☐Y ☐N | Oedema: ☐Y ☐N`,
    `  Lymphadenopathy: ☐Y ☐N | Clubbing: ☐Y ☐N`,
    `  Systemic examination: CVS: ___________ RS: ___________ Abdomen: ___________ CNS: ___________`,
    ``,
    `SECTION E: DIAGNOSIS`,
    `  Provisional diagnosis: ______________________________________________`,
    `  Final diagnosis: __________________________________________________`,
    `  Diagnostic criteria met: ☐ Yes  ☐ No   Criteria used: ______________`,
    ``,
    `SECTION F: INVESTIGATIONS`,
    `  Hb: ___ g/dL | TLC: ___×10³/µL | DLC: N___% L___% M___% E___% B___%`,
    `  Platelets: ___×10³/µL | PCV: ___% | MCV: ___ fL | MCH: ___ pg`,
    `  Na: ___ mEq/L | K: ___ mEq/L | Creatinine: ___ mg/dL | Urea: ___ mg/dL`,
    `  Blood glucose (fasting): ___ mg/dL | Blood glucose (PP): ___ mg/dL`,
    `  Bilirubin (T/D): ___/___ mg/dL | SGOT: ___ U/L | SGPT: ___ U/L | ALP: ___ U/L`,
    `  Urine R/M: ___________ | Culture: ___________`,
    `  Chest X-ray: ___________ | ECG: ___________ | Echocardiography: ___________`,
    `  Other relevant investigations: ___________________________________________`,
    ``,
    `SECTION G: ${d.intervention ? 'INTERVENTION' : 'TREATMENT GIVEN'}`,
    d.intervention
      ? `  Group: ☐ Intervention (${d.intervention})  ☐ Control`
      : `  Treatment: ________________________________________________`,
    `  Date started: __________ | Date completed/stopped: __________`,
    `  Dose/Frequency: ______________ | Route: ______________`,
    `  Adverse events: ☐ None  ☐ Mild  ☐ Moderate  ☐ Severe | Details: ______________`,
    `  Concomitant medications: _______________________________________________`,
    ``,
    `SECTION H: OUTCOME ASSESSMENT`,
    `  Primary outcome (${d.primaryOutcome || '[Primary Outcome]'}):`,
    `  At baseline: ______________ | At follow-up 1 (Day/Week ___): ______________`,
    `  At follow-up 2 (Day/Week ___): ______________ | At final visit: ______________`,
    ``,
    `  Secondary outcomes:`,
    `  ${(d.secondaryOutcomes || '[Secondary Outcomes]').split('\n').join('\n  ')}`,
    ``,
    `  Duration of hospital stay: ___ days`,
    `  Outcome: ☐ Discharged ☐ Improved ☐ Referred ☐ LAMA ☐ Expired`,
    `  Cause of death (if applicable): ____________`,
    ``,
    `SECTION I: FOLLOW-UP (if applicable)`,
    `  Follow-up visit 1: Date __________ Findings: ____________________________`,
    `  Follow-up visit 2: Date __________ Findings: ____________________________`,
    `  Follow-up visit 3: Date __________ Findings: ____________________________`,
    `  Patient lost to follow-up: ☐ Yes  ☐ No  Reason: ________________________`,
    ``,
    `Investigator's signature: ________________ Date: __________`,
  ]
  return common
}
