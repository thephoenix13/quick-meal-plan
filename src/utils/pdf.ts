import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MealPlan } from '../types';

export function generatePDF(mealPlan: MealPlan) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text("Doctor's Meal Plan Generator", pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient: ${mealPlan.patientName}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.text(`Generated: ${mealPlan.generatedDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.text(`Daily Calorie Target: ${mealPlan.dailyCalorieTarget} kcal`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Summary
  if (mealPlan.summary) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Plan Summary:', 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(mealPlan.summary, pageWidth - 28);
    doc.text(summaryLines, 14, yPos);
    yPos += summaryLines.length * 5 + 8;
  }

  // Daily Plans
  mealPlan.dailyPlan.forEach((dayPlan) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Day header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Day ${dayPlan.day}`, 14, yPos);
    yPos += 8;

    // Meals table
    const tableData = dayPlan.meals.map((meal) => [
      meal.mealType,
      meal.name,
      meal.portionSize,
      `${meal.calories}`,
      `${meal.protein}g`,
      `${meal.carbs}g`,
      `${meal.fat}g`,
      `${meal.fibre}g`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Meal', 'Dish', 'Portion', 'Cal', 'Protein', 'Carbs', 'Fat', 'Fibre']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 14 },
        4: { cellWidth: 16 },
        5: { cellWidth: 14 },
        6: { cellWidth: 14 },
        7: { cellWidth: 14 },
      },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 6;

    // Meal details
    dayPlan.meals.forEach((meal) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${meal.mealType}: ${meal.name}`, 14, yPos);
      yPos += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      if (meal.description) {
        const descLines = doc.splitTextToSize(meal.description, pageWidth - 28);
        doc.text(descLines, 14, yPos);
        yPos += descLines.length * 4;
      }

      if (meal.whyItWorks) {
        doc.setFont('helvetica', 'italic');
        const whyLines = doc.splitTextToSize(`Why: ${meal.whyItWorks}`, pageWidth - 28);
        doc.text(whyLines, 14, yPos);
        yPos += whyLines.length * 4;
      }

      if (meal.ingredients && meal.ingredients.length > 0) {
        doc.setFont('helvetica', 'normal');
        const ingLines = doc.splitTextToSize(`Ingredients: ${meal.ingredients.join(', ')}`, pageWidth - 28);
        doc.text(ingLines, 14, yPos);
        yPos += ingLines.length * 4;
      }

      yPos += 3;
    });

    yPos += 6;
  });

  // Disclaimer
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Disclaimer:', 14, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const disclaimer =
    'This meal plan is generated as a suggestion based on the provided health profile and is NOT medical advice. Please consult with a qualified doctor or registered dietitian before making any changes to your diet, especially if you have existing health conditions. Individual nutritional needs may vary. This plan should be reviewed and approved by a healthcare professional before implementation.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 28);
  doc.text(disclaimerLines, 14, yPos);

  // Save
  doc.save(`MealPlan_${mealPlan.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
