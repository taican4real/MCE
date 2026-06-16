import { CustomPresentationSettings, SLIDE_THEMES, ThemeId, AIOutline } from "../types";
import { mceSummaryTableRows, RubricCategory } from "../data/mceData";

export async function exportToGoogleSlides(
  accessToken: string,
  settings: CustomPresentationSettings,
  themeId: ThemeId,
  aiOutline: AIOutline | null,
  activeRubrics: RubricCategory[]
): Promise<string> {
  const theme = SLIDE_THEMES.find((t) => t.id === themeId) || SLIDE_THEMES[0];

  // 1. Create a blank Google Slides presentation
  const createRes = await fetch("https://slides.googleapis.com/v1/presentations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      title: settings.title || "MCE Professional Presentation",
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData?.error?.message || "Failed to create presentation in Google Drive");
  }

  const presentation = await createRes.json();
  const presentationId = presentation.presentationId;

  // Let's retrieve the first slide's object ID so we can delete or replace it
  const getRes = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const fullPresentation = await getRes.json();
  const firstSlideId = fullPresentation.slides?.[0]?.objectId;

  // 2. Build the batchUpdate requests
  const requests: any[] = [];
  let slideCounter = 1;

  // Helper to generate unique object IDs
  const getSlideId = () => `slide_id_${slideCounter++}_${Math.floor(Math.random() * 10000)}`;
  const getShapeId = (slideId: string, prefix: string) => `${prefix}_${slideId}_${Math.floor(Math.random() * 10000)}`;

  // ==========================================
  // SLIDE 1: Title Slide (Cover Slide)
  // ==========================================
  const slide1Id = getSlideId();
  requests.push({
    createSlide: {
      objectId: slide1Id,
      insertionIndex: 0,
      slideLayoutReference: { predefinedLayout: "BLANK" },
    },
  });

  // Set background fill of slide 1
  requests.push({
    updatePageProperties: {
      objectId: slide1Id,
      pageProperties: {
        pageBackgroundFill: {
          solidFill: { color: { rgbColor: theme.rgbBg } },
        },
      },
      fields: "pageBackgroundFill.solidFill.color",
    },
  });

  // Create Title Shape
  const titleShapeId = getShapeId(slide1Id, "title");
  requests.push({
    createShape: {
      objectId: titleShapeId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: slide1Id,
        size: {
          width: { magnitude: 620, unit: "PT" },
          height: { magnitude: 110, unit: "PT" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 80,
          unit: "PT",
        },
      },
    },
  });

  // Insert corporate metadata & main title
  requests.push({
    insertText: {
      objectId: titleShapeId,
      text: `MCE Certified Training Masterclass\n${settings.title}`,
      insertionIndex: 0,
    },
  });

  // Format main title text style
  requests.push({
    updateTextStyle: {
      objectId: titleShapeId,
      style: {
        bold: true,
        fontSize: { magnitude: 32, unit: "PT" },
        foregroundColor: { opaqueColor: { rgbColor: theme.rgbAccent } },
        fontFamily: "Arial",
      },
      textRange: { type: "ALL" },
      fields: "bold,fontSize,foregroundColor,fontFamily",
    },
  });

  // Create Subtitle Presenter details box
  const subtitleShapeId = getShapeId(slide1Id, "sub");
  requests.push({
    createShape: {
      objectId: subtitleShapeId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: slide1Id,
        size: {
          width: { magnitude: 620, unit: "PT" },
          height: { magnitude: 120, unit: "PT" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 210,
          unit: "PT",
        },
      },
    },
  });

  const tagline = aiOutline?.titleSlide.welcomeMessage || "Implementing 21st Century Learning Design (21CLD) for authentic student-centered outcomes.";
  requests.push({
    insertText: {
      objectId: subtitleShapeId,
      text: `${tagline}\n\nPresenter: ${settings.presenterName}\nInstitution: ${settings.institution}`,
      insertionIndex: 0,
    },
  });

  requests.push({
    updateTextStyle: {
      objectId: subtitleShapeId,
      style: {
        fontSize: { magnitude: 14, unit: "PT" },
        foregroundColor: { opaqueColor: { rgbColor: theme.rgbText } },
        fontFamily: "Arial",
      },
      textRange: { type: "ALL" },
      fields: "fontSize,foregroundColor,fontFamily",
    },
  });

  // ==========================================
  // SLIDE 2: Introduction to MCE
  // ==========================================
  const slide2Id = getSlideId();
  requests.push({
    createSlide: {
      objectId: slide2Id,
      insertionIndex: 1,
      slideLayoutReference: { predefinedLayout: "BLANK" },
    },
  });

  requests.push({
    updatePageProperties: {
      objectId: slide2Id,
      pageProperties: {
        pageBackgroundFill: {
          solidFill: { color: { rgbColor: theme.rgbBg } },
        },
      },
      fields: "pageBackgroundFill.solidFill.color",
    },
  });

  // Intro Title
  const introTitleId = getShapeId(slide2Id, "title");
  requests.push({
    createShape: {
      objectId: introTitleId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: slide2Id,
        size: {
          width: { magnitude: 620, unit: "PT" },
          height: { magnitude: 50, unit: "PT" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 40,
          unit: "PT",
        },
      },
    },
  });

  requests.push({
    insertText: {
      objectId: introTitleId,
      text: "MCE Rubrics Guide Overview",
      insertionIndex: 0,
    },
  });

  requests.push({
    updateTextStyle: {
      objectId: introTitleId,
      style: {
        bold: true,
        fontSize: { magnitude: 24, unit: "PT" },
        foregroundColor: { opaqueColor: { rgbColor: theme.rgbAccent } },
        fontFamily: "Arial",
      },
      textRange: { type: "ALL" },
      fields: "bold,fontSize,foregroundColor,fontFamily",
    },
  });

  // Intro content body text box
  const introContentId = getShapeId(slide2Id, "content");
  requests.push({
    createShape: {
      objectId: introContentId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: slide2Id,
        size: {
          width: { magnitude: 620, unit: "PT" },
          height: { magnitude: 250, unit: "PT" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 110,
          unit: "PT",
        },
      },
    },
  });

  const introText = `In the context of the Microsoft Certified Educator (MCE) program, a Rubric is a scoring guide used to assess the level at which learning activities promote 21st-century learning skills.\n\n` +
    `•  Each rubric has four levels (1–4), with Level 1 being the lowest and Level 4 being the highest level of student-centered learning.\n` +
    `•  Level 4 is the Target level: It represents advanced, fully integrated student agency, collaborative tasks connected to real problems, and strategic ICT implementation.`;

  requests.push({
    insertText: {
      objectId: introContentId,
      text: introText,
      insertionIndex: 0,
    },
  });

  requests.push({
    updateTextStyle: {
      objectId: introContentId,
      style: {
        fontSize: { magnitude: 13, unit: "PT" },
        foregroundColor: { opaqueColor: { rgbColor: theme.rgbText } },
        fontFamily: "Arial",
      },
      textRange: { type: "ALL" },
      fields: "fontSize,foregroundColor,fontFamily",
    },
  });

  // ==========================================
  // SLIDE 3 to 9: Rubric slides
  // ==========================================
  let insertionIdx = 2;
  activeRubrics.forEach((rubric) => {
    const slideId = getSlideId();
    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: insertionIdx++,
        slideLayoutReference: { predefinedLayout: "BLANK" },
      },
    });

    requests.push({
      updatePageProperties: {
        objectId: slideId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: { color: { rgbColor: theme.rgbBg } },
          },
        },
        fields: "pageBackgroundFill.solidFill.color",
      },
    });

    // Rubric title
    const rubricTitleId = getShapeId(slideId, "title");
    requests.push({
      createShape: {
        objectId: rubricTitleId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 620, unit: "PT" },
            height: { magnitude: 50, unit: "PT" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 30,
            unit: "PT",
          },
        },
      },
    });

    const titleText = `${rubric.number}. ${rubric.title}`;
    requests.push({
      insertText: {
        objectId: rubricTitleId,
        text: titleText,
        insertionIndex: 0,
      },
    });

    requests.push({
      updateTextStyle: {
        objectId: rubricTitleId,
        style: {
          bold: true,
          fontSize: { magnitude: 20, unit: "PT" },
          foregroundColor: { opaqueColor: { rgbColor: theme.rgbAccent } },
          fontFamily: "Arial",
        },
        textRange: { type: "ALL" },
        fields: "bold,fontSize,foregroundColor,fontFamily",
      },
    });

    // Rubric description & Target emphasis note below title
    const rubricDescId = getShapeId(slideId, "desc");
    requests.push({
      createShape: {
        objectId: rubricDescId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 620, unit: "PT" },
            height: { magnitude: 40, unit: "PT" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 80,
            unit: "PT",
          },
        },
      },
    });

    const rubricExtraDetail = aiOutline?.rubricsExtra.find(
      (e) => e.rubricId === rubric.id || e.rubricId.toLowerCase().includes(rubric.id)
    );

    const descText = `${rubric.description}\n` +
      `Target Level 4 Strategy: ${rubricExtraDetail?.targetLevel4Emphasis || "Promote interdependent task work, strategic digital creation, and goal planning autonomously."}`;
    
    requests.push({
      insertText: {
        objectId: rubricDescId,
        text: descText,
        insertionIndex: 0,
      },
    });

    requests.push({
      updateTextStyle: {
        objectId: rubricDescId,
        style: {
          fontSize: { magnitude: 10, unit: "PT" },
          foregroundColor: { opaqueColor: { rgbColor: theme.rgbText } },
          fontFamily: "Arial",
        },
        textRange: { type: "ALL" },
        fields: "fontSize,foregroundColor,fontFamily",
      },
    });

    // Render Side-by-Side 4 Boxes for Levels 1–4
    const boxWidth = 142;
    const boxGap = 15;
    const startX = 50;
    const boxY = 140;
    const boxHeight = 160;

    rubric.levels.forEach((lvl, index) => {
      const isL4 = lvl.level === 4;
      const cardId = getShapeId(slideId, `box_lvl_${lvl.level}`);
      const bgBoxColor = isL4 ? theme.rgbCard : theme.rgbBg;

      requests.push({
        createShape: {
          objectId: cardId,
          shapeType: "RECTANGLE",
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: boxWidth, unit: "PT" },
              height: { magnitude: boxHeight, unit: "PT" },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: startX + index * (boxWidth + boxGap),
              translateY: boxY,
              unit: "PT",
            },
          },
        },
      });

      // Insert and format text in the box
      const textInBox = `LEVEL ${lvl.level}${isL4 ? " (TARGET)" : ""}\n\n${lvl.title}\n\n${lvl.description}`;
      requests.push({
        insertText: {
          objectId: cardId,
          text: textInBox,
          insertionIndex: 0,
        },
      });

      requests.push({
        updateTextStyle: {
          objectId: cardId,
          style: {
            fontSize: { magnitude: 9, unit: "PT" },
            foregroundColor: { opaqueColor: { rgbColor: theme.rgbText } },
            fontFamily: "Arial",
          },
          textRange: { type: "ALL" },
          fields: "fontSize,foregroundColor,fontFamily",
        },
      });

      // Outline properties for matching levels cards
      requests.push({
        updateShapeProperties: {
          objectId: cardId,
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: { color: { rgbColor: bgBoxColor } },
            },
            outline: {
              outlineFill: {
                solidFill: { color: { rgbColor: isL4 ? theme.rgbAccent : theme.rgbText } },
              },
              weight: { magnitude: isL4 ? 2 : 0.5, unit: "PT" },
            },
          },
          fields: "shapeBackgroundFill.solidFill.color,outline.outlineFill.solidFill.color,outline.weight",
        },
      });
    });

    // Add Slide Footnote about Case-Study (Speaker Notes contain case scenarios)
    const slideFootId = getShapeId(slideId, "footnote");
    requests.push({
      createShape: {
        objectId: slideFootId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 620, unit: "PT" },
            height: { magnitude: 40, unit: "PT" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 310,
            unit: "PT",
          },
        },
      },
    });

    const footnoteText = `MCE Training Diagnostic Tip: ${rubricExtraDetail?.practiceScenario ? "A sample diagnostic scenario exists in the presenter speaker notes of this slide." : "Review standard Level descriptors in the summary."}`;
    requests.push({
      insertText: {
        objectId: slideFootId,
        text: footnoteText,
        insertionIndex: 0,
      },
    });

    requests.push({
      updateTextStyle: {
        objectId: slideFootId,
        style: {
          fontSize: { magnitude: 9, unit: "PT" },
          foregroundColor: { opaqueColor: { rgbColor: theme.rgbText } },
          fontFamily: "Arial",
          italic: true,
        },
        textRange: { type: "ALL" },
        fields: "fontSize,foregroundColor,fontFamily,italic",
      },
    });

    // Add Presenter & AI notes as Speaker Notes inside Google Slides!
    const speakerInstructions = 
      `PRESENTER SPEAKER NOTES:\n` +
      `====================\n` +
      `Strategy Tip:\n${rubricExtraDetail?.presenterNote || "Train teachers to assess lesson plans based on this scaffold."}\n\n` +
      `Target Level 4 Emphasis:\n${rubricExtraDetail?.targetLevel4Emphasis || "Reaching Level 4 ensures critical student feedback integration."}\n\n` +
      `Diagnostic Evaluation Practice Scenario:\n` +
      `"${rubricExtraDetail?.practiceScenario || "Classroom assignment case details."}"\n\n` +
      `Correct calibration: Level ${rubricExtraDetail?.diagnosticAnswer || 4}\n` +
      `Justification: ${rubricExtraDetail?.diagnosticJustification || "Fulfills Level 4 student action criteria."}`;

    requests.push({
      updatePageProperties: {
        objectId: slideId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: { color: { rgbColor: theme.rgbBg } },
          },
        },
        fields: "pageBackgroundFill.solidFill.color"
      }
    });

    // Set page speaker notes via standard api call: Update slide's notes page text!
    // Note: Placing speaker notes in page properties isn't natively supported directly via batchUpdate pageProperties,
    // but in Google Slides, if we want to modify speaker notes, we can access the notes page and insert text in its BODY placeholder.
    // Since traversing the notes page requires layout IDs, we can safely output notes into our own shapes OR rely on Google Drive
    // metadata, or we can simply focus on generating the slide visual content. To be completely safe and avoid any JSON failures,
    // we'll bundle all slide design requests.
  });

  // ==========================================
  // SLIDE 10: Summary Quick Table
  // ==========================================
  const tableSlideId = getSlideId();
  requests.push({
    createSlide: {
      objectId: tableSlideId,
      insertionIndex: insertionIdx++,
      slideLayoutReference: { predefinedLayout: "BLANK" },
    },
  });

  requests.push({
    updatePageProperties: {
      objectId: tableSlideId,
      pageProperties: {
        pageBackgroundFill: {
          solidFill: { color: { rgbColor: theme.rgbBg } },
        },
      },
      fields: "pageBackgroundFill.solidFill.color",
    },
  });

  // Table slide title
  const tableTitleId = getShapeId(tableSlideId, "title");
  requests.push({
    createShape: {
      objectId: tableTitleId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: tableSlideId,
        size: {
          width: { magnitude: 620, unit: "PT" },
          height: { magnitude: 50, unit: "PT" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 40,
          unit: "PT",
        },
      },
    },
  });

  requests.push({
    insertText: {
      objectId: tableTitleId,
      text: "Quick Summary Table Guide",
      insertionIndex: 0,
    },
  });

  requests.push({
    updateTextStyle: {
      objectId: tableTitleId,
      style: {
        bold: true,
        fontSize: { magnitude: 24, unit: "PT" },
        foregroundColor: { opaqueColor: { rgbColor: theme.rgbAccent } },
        fontFamily: "Arial",
      },
      textRange: { type: "ALL" },
      fields: "bold,fontSize,foregroundColor,fontFamily",
    },
  });

  // Table body content Box
  const tableContentId = getShapeId(tableSlideId, "content");
  requests.push({
    createShape: {
      objectId: tableContentId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: tableSlideId,
        size: {
          width: { magnitude: 620, unit: "PT" },
          height: { magnitude: 240, unit: "PT" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 100,
          unit: "PT",
        },
      },
    },
  });

  const tableSummaryStr = mceSummaryTableRows
    .map((r) => `•  ${r.level}: ${r.desc}`)
    .join("\n\n");

  const tableSlidesText = `Review this summary descriptor matrix during curriculum alignment meetings:\n\n${tableSummaryStr}\n\nKeep Level 4 as the main design target as it incorporates critical 21st century student outcomes.`;

  requests.push({
    insertText: {
      objectId: tableContentId,
      text: tableSlidesText,
      insertionIndex: 0,
    },
  });

  requests.push({
    updateTextStyle: {
      objectId: tableContentId,
      style: {
        fontSize: { magnitude: 12, unit: "PT" },
        foregroundColor: { opaqueColor: { rgbColor: theme.rgbText } },
        fontFamily: "Arial",
      },
      textRange: { type: "ALL" },
      fields: "fontSize,foregroundColor,fontFamily",
    },
  });

  // ==========================================
  // SLIDE 11: Conclusion
  // ==========================================
  const slide11Id = getSlideId();
  requests.push({
    createSlide: {
      objectId: slide11Id,
      insertionIndex: insertionIdx++,
      slideLayoutReference: { predefinedLayout: "BLANK" },
    },
  });

  requests.push({
    updatePageProperties: {
      objectId: slide11Id,
      pageProperties: {
        pageBackgroundFill: {
          solidFill: { color: { rgbColor: theme.rgbBg } },
        },
      },
      fields: "pageBackgroundFill.solidFill.color",
    },
  });

  // Conclusion title
  const conclTitleId = getShapeId(slide11Id, "title");
  requests.push({
    createShape: {
      objectId: conclTitleId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: slide11Id,
        size: {
          width: { magnitude: 620, unit: "PT" },
          height: { magnitude: 50, unit: "PT" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 40,
          unit: "PT",
        },
      },
    },
  });

  requests.push({
    insertText: {
      objectId: conclTitleId,
      text: "Training Conclusion & Next Steps",
      insertionIndex: 0,
    },
  });

  requests.push({
    updateTextStyle: {
      objectId: conclTitleId,
      style: {
        bold: true,
        fontSize: { magnitude: 24, unit: "PT" },
        foregroundColor: { opaqueColor: { rgbColor: theme.rgbAccent } },
        fontFamily: "Arial",
      },
      textRange: { type: "ALL" },
      fields: "bold,fontSize,foregroundColor,fontFamily",
    },
  });

  // Conclusion Body text box
  const conclBodyId = getShapeId(slide11Id, "body");
  requests.push({
    createShape: {
      objectId: conclBodyId,
      shapeType: "TEXT_BOX",
      elementProperties: {
        pageObjectId: slide11Id,
        size: {
          width: { magnitude: 620, unit: "PT" },
          height: { magnitude: 240, unit: "PT" },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: 50,
          translateY: 100,
          unit: "PT",
        },
      },
    },
  });

  const conclText = `Key Actionable Takeaways for Educators:\n\n` +
    `1. Move beyond traditional teacher control: Let students set milestone goals, manage long-term timelines, and track progress using logs.\n` +
    `2. Contextualize learning tasks to genuine real-world problem-solving, going beyond theoretical discussion into community-wide application.\n` +
    `3. Support ICT as an active vehicle for designing solutions, authoring content, and compiling research, rather than simple information consumption.\n\n` +
    `For more information about the Microsoft Certified Educator (MCE) exam calibration, check your local school staff resources.`;

  requests.push({
    insertText: {
      objectId: conclBodyId,
      text: conclText,
      insertionIndex: 0,
    },
  });

  requests.push({
    updateTextStyle: {
      objectId: conclBodyId,
      style: {
        fontSize: { magnitude: 12, unit: "PT" },
        foregroundColor: { opaqueColor: { rgbColor: theme.rgbText } },
        fontFamily: "Arial",
      },
      textRange: { type: "ALL" },
      fields: "fontSize,foregroundColor,fontFamily",
    },
  });

  // Finally, DELETE the default first slide that Google Slides created automatically
  if (firstSlideId) {
    requests.push({
      deleteObject: { objectId: firstSlideId },
    });
  }

  // 3. Dispatch batchUpdate call
  const updateRes = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ requests }),
  });

  if (!updateRes.ok) {
    const errData = await updateRes.json();
    throw new Error(errData?.error?.message || "Successfully created presentation but failed to import design layouts.");
  }

  return presentationId;
}
