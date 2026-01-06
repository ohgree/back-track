/**
 * Pose Analyzer - Analyzes MediaPipe pose landmarks to detect posture issues
 */

import { PostureStatus, type PostureStatusType, type PostureThresholds } from '../stores/posture.svelte.ts';

export interface Landmark {
	x: number;
	y: number;
	z: number;
	visibility?: number;
}

export interface PostureIssue {
	type: 'too_close' | 'leaning' | 'slouching';
	message: string;
	severity: 'warning' | 'danger';
}

export interface PoseAnalysis {
	status: PostureStatusType;
	confidence: number;
	distance: number;
	leanAngle: number;
	shoulderAngle: number;
	issues: PostureIssue[];
}

// MediaPipe Pose landmark indices
const LANDMARKS = {
	NOSE: 0,
	LEFT_EYE_INNER: 1,
	LEFT_EYE: 2,
	LEFT_EYE_OUTER: 3,
	RIGHT_EYE_INNER: 4,
	RIGHT_EYE: 5,
	RIGHT_EYE_OUTER: 6,
	LEFT_EAR: 7,
	RIGHT_EAR: 8,
	MOUTH_LEFT: 9,
	MOUTH_RIGHT: 10,
	LEFT_SHOULDER: 11,
	RIGHT_SHOULDER: 12,
	LEFT_ELBOW: 13,
	RIGHT_ELBOW: 14,
	LEFT_WRIST: 15,
	RIGHT_WRIST: 16,
	LEFT_HIP: 23,
	RIGHT_HIP: 24
} as const;

/**
 * Calculate horizontal distance between two points
 */
function horizontalDistance(a: Landmark, b: Landmark): number {
	return Math.abs(a.x - b.x);
}

/**
 * Estimate distance from camera based on face/shoulder size
 */
function estimateDistance(landmarks: Landmark[]): number | null {
	const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
	const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

	if (!leftShoulder || !rightShoulder) return null;

	const shoulderWidth = horizontalDistance(leftShoulder, rightShoulder);
	const estimatedDistance = 24 / shoulderWidth;

	return Math.round(estimatedDistance);
}

/**
 * Calculate lean angle (left/right tilt)
 * Returns: positive = leaning right, negative = leaning left (as seen in mirrored view)
 */
function calculateLeanAngle(landmarks: Landmark[]): number {
	const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
	const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

	if (!leftShoulder || !rightShoulder) return 0;

	// In selfie/mirrored view, left shoulder has higher x than right shoulder
	// We want to measure tilt from horizontal, so use absolute deltaX
	const deltaY = leftShoulder.y - rightShoulder.y;
	const deltaX = Math.abs(rightShoulder.x - leftShoulder.x);

	if (deltaX < 0.01) return 0; // Shoulders too close together to measure

	const angleRad = Math.atan2(deltaY, deltaX);
	const angleDeg = angleRad * (180 / Math.PI);

	// Negate to match mirrored view perception (lean right = positive)
	// Round to 1 decimal place to reduce jitter
	return Math.round(-angleDeg * 10) / 10;
}

/**
 * Get raw nose-to-shoulder ratio for calibration
 */
export function getNoseToShoulderRatio(landmarks: Landmark[]): number | null {
	const nose = landmarks[LANDMARKS.NOSE];
	const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
	const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];

	if (!nose || !leftShoulder || !rightShoulder) return null;

	const shoulderMid = {
		x: (leftShoulder.x + rightShoulder.x) / 2,
		y: (leftShoulder.y + rightShoulder.y) / 2
	};

	return shoulderMid.y - nose.y;
}

/**
 * Calculate slouch angle (forward head posture)
 * Uses calibrated baseline if provided, otherwise uses default
 */
function calculateSlouchAngle(landmarks: Landmark[], baseline: number | null): number {
	const ratio = getNoseToShoulderRatio(landmarks);
	if (ratio === null) return 0;

	// Use calibrated baseline or fall back to a reasonable default
	const baselineValue = baseline ?? ratio; // If no baseline, assume current is good
	
	// Calculate deviation from baseline
	// Negative deviation (head moving down/forward relative to shoulders) = slouching
	const deviation = baselineValue - ratio;
	
	// Convert to degrees-like value (scale factor for sensitivity)
	// Positive = slouching forward, Negative = leaning back / sitting straighter
	const angleDeg = deviation * 150;

	return Math.round(angleDeg * 10) / 10;
}

/**
 * Main analysis function - returns posture status and metrics
 */
export function analyzePose(
	landmarks: Landmark[], 
	thresholds: PostureThresholds,
	slouchBaseline: number | null = null
): PoseAnalysis {
	if (!landmarks || landmarks.length < 25) {
		return {
			status: PostureStatus.NOT_DETECTED,
			confidence: 0,
			distance: 0,
			leanAngle: 0,
			shoulderAngle: 0,
			issues: []
		};
	}

	const issues: PostureIssue[] = [];

	const distance = estimateDistance(landmarks);
	const leanAngle = calculateLeanAngle(landmarks);
	const slouchAngle = calculateSlouchAngle(landmarks, slouchBaseline);

	const keyLandmarks = [
		landmarks[LANDMARKS.NOSE],
		landmarks[LANDMARKS.LEFT_SHOULDER],
		landmarks[LANDMARKS.RIGHT_SHOULDER]
	];
	const confidence = keyLandmarks.reduce((sum, l) => sum + (l?.visibility || 0), 0) / keyLandmarks.length;

	if (distance !== null && distance < thresholds.minDistance) {
		issues.push({
			type: 'too_close',
			message: `Too close to screen (${distance}cm)`,
			severity: distance < thresholds.minDistance * 0.7 ? 'danger' : 'warning'
		});
	}

	if (Math.abs(leanAngle) > thresholds.maxLeanAngle) {
		const direction = leanAngle > 0 ? 'right' : 'left';
		issues.push({
			type: 'leaning',
			message: `Leaning ${direction} (${Math.abs(leanAngle)}°)`,
			severity: Math.abs(leanAngle) > thresholds.maxLeanAngle * 1.5 ? 'danger' : 'warning'
		});
	}

	if (slouchAngle > thresholds.maxSlouchAngle) {
		issues.push({
			type: 'slouching',
			message: `Slouching detected (${slouchAngle}°)`,
			severity: slouchAngle > thresholds.maxSlouchAngle * 1.5 ? 'danger' : 'warning'
		});
	}

	let status: PostureStatusType = PostureStatus.GOOD;
	if (issues.length > 0) {
		const hasDanger = issues.some(i => i.severity === 'danger');
		if (hasDanger) {
			const dangerIssue = issues.find(i => i.severity === 'danger')!;
			status = dangerIssue.type === 'too_close' ? PostureStatus.TOO_CLOSE :
				dangerIssue.type === 'leaning' ? PostureStatus.LEANING :
					PostureStatus.SLOUCHING;
		} else {
			const firstIssue = issues[0];
			status = firstIssue.type === 'too_close' ? PostureStatus.TOO_CLOSE :
				firstIssue.type === 'leaning' ? PostureStatus.LEANING :
					PostureStatus.SLOUCHING;
		}
	}

	return {
		status,
		confidence: Math.round(confidence * 100),
		distance: distance || 0,
		leanAngle,
		shoulderAngle: slouchAngle,
		issues
	};
}

