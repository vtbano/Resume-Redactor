/*
 * This file is adapted from OpenResume (https://github.com/xitanggg/open-resume)
 * © 2024 xitanggg (or original authors), licensed under AGPL-3.0
 */

import {
  TextItems,
  TextItem,
  TextScores,
  FeatureSet,
  emptyTextItemDetails,
} from 'lib/parse-resume-from-pdf/types'

const computeFeatureScores = (
  textItems: TextItems,
  featureSets: FeatureSet[]
): TextScores => {
  const textScores = textItems.map((item) => ({
    text: item.text,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    fontName: item.fontName,
    hasEOL: item.hasEOL,
    pageNumber: item.pageNumber,
    score: 0,
    match: false,
  }))

  for (let i = 0; i < textItems.length; i++) {
    const textItem = textItems[i]

    for (const featureSet of featureSets) {
      const [hasFeature, score, returnMatchingText] = featureSet
      const result = hasFeature(textItem)
      if (result) {
        let text = textItem.text
        if (returnMatchingText && typeof result === 'object') {
          text = result[0]
        }

        const textScore = textScores[i]
        if (textItem.text === text) {
          textScore.score += score
          if (returnMatchingText) {
            textScore.match = true
          }
        } else {
          textScores.push({
            text,
            x: textItem.x,
            y: textItem.y,
            width: textItem.width,
            height: textItem.height,
            fontName: textItem.fontName,
            hasEOL: textItem.hasEOL,
            pageNumber: textItem.pageNumber,
            score,
            match: true,
          })
        }
      }
    }
  }
  return textScores
}

/**
 * Core util for the feature scoring system.
 *
 * It runs each text item through all feature sets and sums up the matching feature scores.
 * It then returns the text item with the highest computed feature score.
 */
export const getTextWithHighestFeatureScore = (
  textItems: TextItems,
  featureSets: FeatureSet[],
  returnEmptyStringIfHighestScoreIsNotPositive = true
) => {
  const textScores = computeFeatureScores(textItems, featureSets)

  let textWithHighestFeatureScore: TextItem = emptyTextItemDetails
  let highestScore = -Infinity
  for (const {
    text,
    score,
    x,
    y,
    width,
    height,
    fontName,
    hasEOL,
    pageNumber,
  } of textScores) {
    if (score >= highestScore) {
      if (score > highestScore) {
        textWithHighestFeatureScore = {
          text,
          x,
          y,
          width,
          height,
          fontName,
          hasEOL,
          pageNumber,
        }
        highestScore = score
      }
    }
  }

  if (returnEmptyStringIfHighestScoreIsNotPositive && highestScore <= 0)
    return [emptyTextItemDetails, textScores] as const

  return [textWithHighestFeatureScore, textScores] as const
}
