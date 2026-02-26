import { describe, it, expect } from 'vitest';
import { getPassage, searchVerses, getTodayQT } from '@/server/services/bible.service';
import { AuthError } from '@/server/middleware/auth.middleware';

// FEAT-4: Bible service unit tests

describe('BibleService', () => {
  // =========================================
  // getPassage
  // =========================================
  describe('성경 구절 조회 (getPassage)', () => {
    it('성공적으로 성경 구절을 반환한다', () => {
      const result = getPassage('요한복음', 3, 16);

      expect(result.book).toBe('요한복음');
      expect(result.chapter).toBe(3);
      expect(result.verseStart).toBe(16);
      expect(result.verseEnd).toBe(16);
      expect(result.verses).toHaveLength(1);
      expect(result.verses[0]?.verse).toBe(16);
      expect(result.verses[0]?.text).toContain('하나님이 세상을 이처럼 사랑하사');
      expect(result.fullText).toContain('하나님이 세상을 이처럼 사랑하사');
    });

    it('범위로 여러 구절을 반환한다', () => {
      const result = getPassage('요한복음', 3, 16, 18);

      expect(result.verseStart).toBe(16);
      expect(result.verseEnd).toBe(18);
      expect(result.verses).toHaveLength(3);
      expect(result.verses[0]?.verse).toBe(16);
      expect(result.verses[1]?.verse).toBe(17);
      expect(result.verses[2]?.verse).toBe(18);
    });

    it('존재하지 않는 책명 시 400 에러를 던진다', () => {
      expect(() => getPassage('없는책', 1, 1)).toThrow(AuthError);

      try {
        getPassage('없는책', 1, 1);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('유효하지 않은 성경 책명입니다');
        expect((e as AuthError).statusCode).toBe(400);
      }
    });

    it('구절을 찾지 못하면 404 에러를 던진다', () => {
      expect(() => getPassage('요한복음', 99, 1)).toThrow(AuthError);

      try {
        getPassage('요한복음', 99, 1);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe(
          '해당 구절을 찾을 수 없습니다. 본문을 직접 입력해주세요.',
        );
        expect((e as AuthError).statusCode).toBe(404);
      }
    });

    it('유효한 책이지만 해당 절 번호가 없으면 404 에러를 던진다', () => {
      expect(() => getPassage('요한복음', 3, 99)).toThrow(AuthError);

      try {
        getPassage('요한복음', 3, 99);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).statusCode).toBe(404);
      }
    });
  });

  // =========================================
  // searchVerses
  // =========================================
  describe('성경 검색 (searchVerses)', () => {
    it('검색어와 일치하는 구절을 반환한다', () => {
      const result = searchVerses('하나님', 1, 10);

      expect(result.query).toBe('하나님');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0]?.text).toContain('하나님');
      expect(result.results[0]?.matchHighlight).toBeTruthy();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBeGreaterThan(0);
    });

    it('결과가 없으면 빈 배열을 반환한다', () => {
      const result = searchVerses('존재하지않는검색어xyz', 1, 10);

      expect(result.query).toBe('존재하지않는검색어xyz');
      expect(result.results).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('페이지네이션이 올바르게 동작한다', () => {
      const result = searchVerses('하나님', 1, 1);

      expect(result.results).toHaveLength(1);
      expect(result.meta.limit).toBe(1);
      expect(result.meta.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================
  // getTodayQT
  // =========================================
  describe('오늘의 QT (getTodayQT)', () => {
    it('오늘의 QT를 반환한다', () => {
      const result = getTodayQT();

      expect(result.book).toBe('요한복음');
      expect(result.chapter).toBe(3);
      expect(result.verseStart).toBe(16);
      expect(result.verseEnd).toBe(18);
      expect(result.title).toBe('하나님의 사랑');
      expect(result.fullText).toBeTruthy();
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
