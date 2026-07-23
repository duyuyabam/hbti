// Firestore 전체 데이터 삭제 스크립트 (admin SDK)
// GitHub Actions(wipe.yml)에서 수동 트리거로만 실행됩니다.
// 인증: GOOGLE_APPLICATION_CREDENTIALS 에 서비스 계정 JSON 경로.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const sa = JSON.parse(readFileSync(keyPath, 'utf8'));

initializeApp({ credential: cert(sa), projectId: 'hbti-bc187' });
const db = getFirestore();

// 삭제 대상 최상위 컬렉션 (하위 컬렉션은 recursiveDelete 가 함께 지움)
const COLLECTIONS = ['hbti_sessions', 'hbti_wall', 'hbti_results', 'hbti_meta'];

async function wipe() {
  for (const name of COLLECTIONS) {
    const col = db.collection(name);
    const snap = await col.get();
    console.log(`[${name}] 문서 ${snap.size}개 삭제 시작...`);
    await db.recursiveDelete(col);
    console.log(`[${name}] 완료`);
  }
  console.log('모든 대상 컬렉션 삭제 완료.');
}

wipe().then(() => process.exit(0)).catch((e) => {
  console.error('삭제 실패:', e);
  process.exit(1);
});
