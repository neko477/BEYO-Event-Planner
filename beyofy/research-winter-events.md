# BEYOOOOONDS winter event research (2026-10-02)

Sources and verified initial prices:

- 11/11 Budokan: official https://helloproject.com/event/6466c46f8d951657d36204f08ecf05dad910ffa642607b4de3dff6e13fc1837d/ — general/family/side stand etc. ¥9,800; side stand A variants ¥9,300.
- 11/26 Fuchu / 12/7 NHK Osaka: official https://helloproject.com/event/22fb08b4cbabbb7af59fd5e5cd85d07debb8c3f91f362faaa44a5f2a357fc162/ — general/family ¥9,000 each.
- 10/31 Livejack: official https://helloproject.com/event/77c8f531d495ecbf427776654a9aa65e08e4a47520497a66a761b79bd3dd817a/ — reserved/seated ¥11,000.
- 12/19 IWA ROCK: official https://helloproject.com/event/a18324f0a44bff40490b436d7d32a9aa97acd36199c4576fc9cbec69b2bbe9ac/ — 1F standing ¥7,500 or 2F reserved ¥8,000, plus ¥600 drink.
- Winter event overview: https://helloproject.com/beyooooonds/event/3fcee29d0c622f492781b1ca0deaec9428afb6acae9f3e8cede4f9c2b90f1f44/ — mini-live dates 11/22 Ario Hashimoto, 11/23 Kobe Harborland, 11/24 Club Citta; mini-live free viewing but priority/omukae requires CD purchase.
- 11/22 Ario Hashimoto: https://helloproject.com/event/f6522bdd03520acbf4ed70f3109a61021508513d121ed00cf3272392739a39b4/ — normal A+B 2-CD set ¥2,600, one set gives priority viewing + send-off; max 2 sets per transaction; delivery cost not specified in extracted official page.
- 11/23 Kobe: https://helloproject.com/event/fc15c99621b65f0e6a23c0cdb43e20cd364daa1f4f44f45a2c674f4e0de36322/ — normal A+B 2-CD set ¥2,600; max 2 sets per transaction.
- 11/24 Club Citta: https://helloproject.com/event/c53ad213b906c759fa570d0ad771a32b4ed313f806ca8071ee06a772f2fb6b1d/ — online lottery A+B 2-CD set ¥2,600 + ¥220 shipping; separate ¥600 drink required; same-day A+B ¥2,600; single A or B ¥1,300 for send-off only.

Implementation choice: add winter event categories to the same planner, with editable per-event ticket/CD quantity plus transport cost, lodging cost, and other cost. New input copies reset travel/lodging/other to 0 to avoid duplicating trip expenses when carrying forward a purchase.
