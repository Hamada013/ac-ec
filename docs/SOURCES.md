# Where the AC / EC skills come from

## The original list

The repository holds no citation for the original 128 skills (67 AC, 61 EC). They arrived in one commit with no source named.

The evidence points to the **Preschool Language Scales, Fifth Edition (PLS-5)**: Zimmerman, Steiner & Pond, Pearson, 2011. It has the same two scales (Auditory Comprehension and Expressive Communication), the same age span (birth to 7:11), and 65 AC items, the number in the original code comment. The item wording was not compared with the test, because its manual is not public. **This is an inference, to be confirmed by whoever built the list.**

If it is an adaptation of the PLS-5, it needs Pearson's permission before being published or before norms are built on it.

## Sources used to check it

Language milestones:

1. ASHA. Communication Milestones, by age: [Birth to 1 year](https://www.asha.org/public/developmental-milestones/communication-milestones-birth-to-1-year/), [13 to 18 months](https://www.asha.org/public/developmental-milestones/communication-milestones-13-to-18-months/), [19 to 24 months](https://www.asha.org/public/developmental-milestones/communication-milestones-19-to-24-months/), [2 to 3 years](https://www.asha.org/public/developmental-milestones/communication-milestones-2-to-3-years/), [3 to 4 years](https://www.asha.org/public/developmental-milestones/communication-milestones-3-to-4-years/), [4 to 5 years](https://www.asha.org/public/developmental-milestones/communication-milestones-4-to-5-years/). ASHA's list stops at 5 years.
2. Zubler JM, Wiggins LD, Macias MM, et al. [Evidence-Informed Milestones for Developmental Surveillance Tools](https://pmc.ncbi.nlm.nih.gov/articles/PMC9680195/). *Pediatrics*. 2022;149(3):e2021052138. doi:10.1542/peds.2021-052138. CDC/AAP milestones: at least 75% of children are expected to have the skill by that age. Also at [CDC Learn the Signs](https://www.cdc.gov/act-early/milestones/index.html). The authors say these lists are not standards.

Arabic research:

3. Hamdan JM, Hamdan HJ. [Emergence and Development of Wh-questions in Jordanian Arabic-speaking Children](https://eejpl.vnu.edu.ua/index.php/eejpl/article/view/364). *East European Journal of Psycholinguistics*. 2020;7(2):28–55. doi:10.29038/eejpl.2020.7.2.ham. Two children, so order of questions only, not ages.
4. Abdelwahab AGS, Forbes S, Cattani A, Goslin J, Floccia C. [An Adaptation of the MacArthur-Bates CDI in 17 Arabic Dialects for Children Aged 8 to 30 Months](https://www.psy.plymouth.ac.uk/OpenArabicCDI/). *Language Learning and Development*. 2021. Includes the Syrian dialect. The norms come from Egyptian children.
5. [Developmental Trajectories of Verbal and Verbless Negation in Jordanian Arabic](https://psycholing-journal.com/index.php/journal/article/view/1581). *Psycholinguistics*. 2025;38(1):41–76. 56 children aged 3–9. **Only a search summary could be read: the journal blocks automated access. Please check the full paper.**

Bell curve: the SPG Therapy Bell Curve Guide's own cut-offs could not be found online. The sheet uses the standard calculation (mean 100, SD 15) and labels you can edit in `research/settings.json`. Please compare them with your copy.

## How added skills were chosen

A skill was added only if ASHA, CDC/AAP or Arabic research lists it **and** no existing item covers it, after reading each nearby item's full instructions, not only its title.

Age band rule: a CDC "by X" milestone goes in the band ending at or just before X, following its 75% rule. An ASHA age range goes in the band it overlaps most. Where the two disagree, the band between them is used.

All wording, procedures and scoring of the added skills are new drafts for clinical review. Each carries its source in the app and on the `Sources` sheet.

**Considered and left out because already covered:** waving and clapping (EC14), asking for help and nodding yes/no (EC25), two-step directions (AC32), comparing (EC41), sentences of 3–4 words (EC29), repeated syllables like mama/baba (EC15), book handling (AC53, AC65), answering wh-questions (EC39), story retelling (EC47–52).

**Left out for other reasons:** the articles "a/the" (English grammar with no checked Arabic equivalent), speech clarity (belongs in the articulation test), writing and pretend reading (outside spoken language).

## Original skills to watch

These were not moved. ASHA and CDC/AAP describe mostly English-speaking children, so a difference may be real for Arabic. The sheet's `Age check` column will show what your children actually do.

| Item | Skill | Placed at | ASHA / CDC |
|---|---|---|---|
| AC29 | Basic body parts | 2:6–2:11 | ASHA 13–18 months; CDC by 24 months |
| EC15 | Two-syllable strings (mama, baba) | 1:0–1:5 | ASHA 7–9 months; CDC by 9 months |
| EC31 | Plurals | 3:6–3:11 | ASHA 2–3 years |
| EC40 | Past tense | 4:6–4:11 | ASHA 2–3 years |
| EC45 | Giving reasons | 5:6–5:11 | ASHA 2–3 years |
| EC47–52 | Telling a story | 6:0–6:11 | ASHA 3–4 years; CDC by 5 years (2 events) |
| AC51 | Hearing first sounds | 5:6–5:11 | ASHA 3–4 years says the sounds in words |
| EC60 | Producing rhymes | 7:0–7:11 | ASHA 4–5 years and CDC by 5 years recognise rhymes |

Corrected typing errors in the age labels: EC `1:5-1:0` is now 1:0–1:5, and EC `5:0-5:11` is now 5:0–5:5.

## Limits

- No age band here is a norm. Only your pilot data can supply those.
- Language age is an estimate from item order. Adding skills changes the numbering, so any data must be collected on one version of the list.
- Counting starts after 3 passes in a row and stops after 7 fails in a row. Please confirm this against the original test rules (`BASAL_RUN`, `CEILING_RUN` in `assets/model.js`).
