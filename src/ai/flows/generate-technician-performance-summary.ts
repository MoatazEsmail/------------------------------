'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate an AI-powered summary
 * of a technician's monthly productivity, highlighting performance against targets,
 * strengths, and areas for improvement for supervisors.
 *
 * - generateTechnicianPerformanceSummary - A function that handles the generation of the summary.
 * - GenerateTechnicianPerformanceSummaryInput - The input type for the function.
 * - GenerateTechnicianPerformanceSummaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateTechnicianPerformanceSummaryInputSchema = z.object({
  technicianName: z.string().describe('اسم الفني.'),
  technicianType: z.enum(['فني مدخنة', 'فني تحويلات']).describe('نوع الفني (فني مدخنة أو فني تحويلات).'),
  month: z.string().describe('الشهر الذي يتم تلخيص الأداء فيه (مثال: "يناير 2024").'),
  actualNormalizedProductivity: z.number().describe('الإنتاجية الفعلية للفني بعد التحويل إلى وحدة قياس موحدة (مداخن لفنيي المداخن، أجهزة منزلية مكافئة لفنيي التحويلات).'),
  targetNormalizedProductivity: z.number().describe('الإنتاجية المستهدفة للفني بعد التحويل إلى وحدة قياس موحدة.'),
  rawProductivityBreakdown: z.object({
    gasStoveConversions: z.number().describe('عدد تحويلات البوتجاز.'),
    waterHeaterConversions: z.number().describe('عدد تحويلات السخان.'),
    householdApplianceReplacements: z.number().describe('عدد استبدال الأجهزة المنزلية.'),
    commercialApplianceReplacements: z.number().describe('عدد استبدال الأجهزة التجارية.'),
    commercialApplianceConversions: z.number().describe('عدد تحويلات الأجهزة التجارية.'),
    chimneyInstallations: z.number().describe('عدد تركيبات المداخن (إذا كان فني تحويلات قام بتركيب مداخن).'),
    convertedAppliancesFromChimneyWork: z.number().describe('عدد الأجهزة المحولة من أعمال المداخن (إذا كان فني مداخن قام بتحويل أجهزة).')
  }).describe('تفصيل الإنتاجية الخام حسب نوع العمل.'),
  performancePercentage: z.number().describe('النسبة المئوية للأداء الفعلي مقارنة بالهدف (مثال: 95 تعني 95%).'),
  status: z.enum(['أقل من الهدف', 'حقق الهدف']).describe('حالة الفني (حقق الهدف أو أقل من الهدف).'),
}).describe('المدخلات المطلوبة لتوليد ملخص أداء الفني.');

export type GenerateTechnicianPerformanceSummaryInput = z.infer<typeof GenerateTechnicianPerformanceSummaryInputSchema>;

// Define the output schema for the flow
const GenerateTechnicianPerformanceSummaryOutputSchema = z.object({
  summary: z.string().describe('ملخص شامل لأداء الفني لهذا الشهر.'),
  strengths: z.array(z.string()).describe('نقاط القوة الرئيسية للفني بناءً على إنتاجيته.'),
  areasForImprovement: z.array(z.string()).describe('المجالات التي يمكن للفني تحسينها.'),
  recommendations: z.array(z.string()).describe('توصيات محددة للمشرف لمساعدة الفني على تحسين أدائه أو الحفاظ عليه.'),
  targetAchieved: z.boolean().describe('صحيح إذا حقق الفني هدفه، خطأ بخلاف ذلك.'),
}).describe('المخرجات المتوقعة لملخص أداء الفني.');

export type GenerateTechnicianPerformanceSummaryOutput = z.infer<typeof GenerateTechnicianPerformanceSummaryOutputSchema>;

// Define the prompt for the AI model
const generateTechnicianPerformanceSummaryPrompt = ai.definePrompt({
  name: 'generateTechnicianPerformanceSummaryPrompt',
  input: { schema: GenerateTechnicianPerformanceSummaryInputSchema },
  output: { schema: GenerateTechnicianPerformanceSummaryOutputSchema },
  prompt: `أنت محلل أداء محترف. مهمتك هي تحليل بيانات إنتاجية الفنيين الشهرية وتقديم ملخص شامل للمشرف.

اسم الفني: {{{technicianName}}}
نوع الفني: {{{technicianType}}}
الشهر: {{{month}}}
الإنتاجية الفعلية (موحدة): {{{actualNormalizedProductivity}}}
الهدف (موحد): {{{targetNormalizedProductivity}}}
النسبة المئوية للأداء مقابل الهدف: {{{performancePercentage}}}%
الحالة: {{{status}}}

تفاصيل الإنتاجية الخام:
تحويل بوتجاز: {{{rawProductivityBreakdown.gasStoveConversions}}}
تحويل سخان: {{{rawProductivityBreakdown.waterHeaterConversions}}}
استبدال أجهزة منزلية: {{{rawProductivityBreakdown.householdApplianceReplacements}}}
استبدال أجهزة تجارية: {{{rawProductivityBreakdown.commercialApplianceReplacements}}}
تحويل أجهزة تجارية: {{{rawProductivityBreakdown.commercialApplianceConversions}}}
تركيبات المداخن (فني تحويلات): {{{rawProductivityBreakdown.chimneyInstallations}}}
الأجهزة المحولة من أعمال المداخن (فني مداخن): {{{rawProductivityBreakdown.convertedAppliancesFromChimneyWork}}}

بناءً على البيانات أعلاه، قم بإنشاء ملخص أداء شامل يتضمن ما يلي:
1.  **summary (ملخص):** ملخص عام لمدى تحقيق الفني لأهدافه وما يميز أدائه هذا الشهر.
2.  **strengths (نقاط القوة):** قائمة بنقاط القوة المحددة للفني بناءً على تفاصيل إنتاجيته (مثال: أداء متميز في تحويلات البوتجاز، أو قدرة عالية على التعامل مع الأجهزة التجارية).
3.  **areasForImprovement (مجالات التحسين):** قائمة بالمجالات التي يمكن للفني تحسينها لزيادة إنتاجيته أو تنويع مهاراته.
4.  **recommendations (توصيات):** توصيات عملية ومحددة للمشرف لمساعدة الفني على تعزيز نقاط قوته أو معالجة مجالات التحسين.
5.  **targetAchieved (حقق الهدف):** قيمة منطقية (صحيح/خطأ) تشير إلى ما إذا كان الفني قد حقق هدفه الشهري أم لا.

الإنتاجية الموحدة لفنيي المداخن هي "مداخن". الإنتاجية الموحدة لفنيي التحويلات هي "أجهزة منزلية مكافئة".
تذكر أن 3 أجهزة منزلية تعادل مدخنة واحدة، وجهاز تجاري واحد يعادل جهازًا منزليًا ونصف. استخدم هذه المعلومات لتحديد نقاط القوة والضعف في أنواع المهام إذا كانت ذات صلة بالملخص.
`,
});

// Define the Genkit flow
const generateTechnicianPerformanceSummaryFlow = ai.defineFlow(
  {
    name: 'generateTechnicianPerformanceSummaryFlow',
    inputSchema: GenerateTechnicianPerformanceSummaryInputSchema,
    outputSchema: GenerateTechnicianPerformanceSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await generateTechnicianPerformanceSummaryPrompt(input);
    if (!output) {
      throw new Error('Failed to generate technician performance summary.');
    }
    return output;
  }
);

// Wrapper function to call the Genkit flow
export async function generateTechnicianPerformanceSummary(
  input: GenerateTechnicianPerformanceSummaryInput
): Promise<GenerateTechnicianPerformanceSummaryOutput> {
  return generateTechnicianPerformanceSummaryFlow(input);
}
