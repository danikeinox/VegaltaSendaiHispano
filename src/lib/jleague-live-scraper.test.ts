import { describe, expect, it } from "vitest";
import {
  isVegaltaRelevantFixture,
  mergeJLeagueFixtures,
  parseJLeagueGamePage,
} from "@/lib/jleague-live-scraper";

const SAMPLE_HTML = `
<h4>2026年6月13日(土)</h4>
<div class="gamelistWrap jleagueallstar">
  <div class="ttlNoLink"><h3>ＪリーグオールスターDAZNカップ</h3></div>
  <ul class="gamelist">
    <li><div class="start">
      <a href="/match/jleagueallstar/2026/061306/live/">
        <table class="gameTable"><tbody><tr>
          <td class="clubNameArea"><span class="embM embNone">J2・J3 EAST-A</span>J2J3EAST-A</td>
          <td class="status"><ul>
            <li class="point off">2-0</li>
            <li class="icon"><span class="off">試合終了</span></li>
            <li class="stadium">[ MUFG国立 ]</li>
          </ul></td>
          <td class="clubNameArea"><span class="embM embNone">J2・J3 EAST-B</span>J2J3EAST-B</td>
        </tr></tbody></table>
      </a>
    </div></li>
    <li><div class="start">
      <a href="/match/jleagueallstar/2026/061308/live/">
        <table class="gameTable"><tbody><tr>
          <td class="clubNameArea"><span class="embM embNone">J1 EAST</span>J1EAST</td>
          <td class="status"><ul>
            <li class="point off">0-0</li>
            <li class="pk">(1 PK 2)</li>
            <li class="icon"><span class="off">試合終了</span></li>
            <li class="stadium">[ MUFG国立 ]</li>
          </ul></td>
          <td class="clubNameArea"><span class="embM embNone">J2・J3 EAST-A</span>J2J3EAST-A</td>
        </tr></tbody></table>
      </a>
    </div></li>
    <li><div class="start">
      <a href="/match/jleagueallstar/2026/061310/preview/">
        <table class="gameTable"><tbody><tr>
          <td class="clubNameArea"><span class="embM embNone">J2・J3 EAST-A</span>J2J3EAST-A</td>
          <td class="status"><ul>
            <li class="point off">19:35</li>
            <li class="stadium">[ MUFG国立 ]</li>
          </ul></td>
          <td class="clubNameArea"><span class="embM embNone">J2・J3 WEST-B</span>J2J3WEST-B</td>
        </tr></tbody></table>
      </a>
    </div></li>
  </ul>
</div>
`;

describe("parseJLeagueGamePage", () => {
  it("parses All-Star matches relevant to Vegalta (J2/J3 EAST-A)", () => {
    const parsed = parseJLeagueGamePage(SAMPLE_HTML);
    expect(parsed?.pageDate).toBe("2026-06-13");
    expect(parsed?.matches).toHaveLength(3);
    expect(parsed?.matches[0].homeTeam).toBe("J2/J3 EAST-A");
    expect(parsed?.matches[0].homeGoals).toBe(2);
    expect(parsed?.matches[0].status).toBe("FT");
  });

  it("parses penalty shootout results", () => {
    const parsed = parseJLeagueGamePage(SAMPLE_HTML);
    const semi = parsed?.matches.find(
      (fixture) => fixture.homeTeam === "J1 EAST"
    );
    expect(semi?.status).toBe("PEN");
    expect(semi?.round).toContain("2 PK 1");
  });

  it("parses upcoming kickoff time", () => {
    const parsed = parseJLeagueGamePage(SAMPLE_HTML);
    const finalMatch = parsed?.matches.find(
      (fixture) => fixture.awayTeam === "J2/J3 WEST-B"
    );
    expect(finalMatch?.status).toBe("NS");
    expect(finalMatch?.date).toContain("T10:35:00");
  });
});

describe("mergeJLeagueFixtures", () => {
  it("prefers live J.League scores over stale data", () => {
    const base = [
      {
        id: 1,
        date: "2026-06-13T04:00:00.000Z",
        status: "NS",
        statusLong: "Not Started",
        homeTeam: "J2/J3 EAST-A",
        awayTeam: "J2/J3 EAST-B",
        homeGoals: null,
        awayGoals: null,
        isVegaltaHome: true,
      },
    ];
    const live = [
      {
        id: 2,
        date: "2026-06-13T04:00:00.000Z",
        status: "FT",
        statusLong: "Match Finished",
        homeTeam: "J2/J3 EAST-A",
        awayTeam: "J2/J3 EAST-B",
        homeGoals: 2,
        awayGoals: 0,
        isVegaltaHome: true,
        infoUrl: "https://www.jleague.jp/match/jleagueallstar/2026/061306/live/",
      },
    ];

    const merged = mergeJLeagueFixtures(base, live);
    expect(merged[0].homeGoals).toBe(2);
    expect(merged[0].status).toBe("FT");
  });
});

describe("isVegaltaRelevantFixture", () => {
  it("matches Vegalta Sendai league fixtures", () => {
    expect(
      isVegaltaRelevantFixture({
        id: 1,
        date: "2026-01-01T00:00:00.000Z",
        status: "FT",
        statusLong: "Match Finished",
        homeTeam: "Vegalta Sendai",
        awayTeam: "Yokohama FC",
        homeGoals: 1,
        awayGoals: 0,
        isVegaltaHome: true,
      })
    ).toBe(true);
  });
});
