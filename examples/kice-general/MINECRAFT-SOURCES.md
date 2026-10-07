# Minecraft 문항의 근거와 검증

확인일은 2026-10-08이며, 기준은 **Minecraft Java Edition 1.21.1 바닐라**이다. [문항 원고](fixtures/minecraft.typ)의 20문항·50점과 정답·해설은 하나의 데이터로 관리한다. 게임의 규칙은 아래 공식 배포본에 고정하고, 수량·배치·관찰 로그·독립성 등 출제자가 정한 조건은 문제 자료에 명시했다.

## 공식 배포본

| 자료 | 공식 출처 | 검증값 |
| --- | --- | --- |
| 버전 manifest | [Mojang 1.21.1 manifest](https://piston-meta.mojang.com/v1/packages/cedfc3b6dcbca34e2b478d498bf1d56a8fa2f404/1.21.1.json) | `id: 1.21.1` |
| 서버 배포 JAR | [Mojang server.jar](https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar) | SHA-1 `59353fb40c36d304f2035d51e7d6e6baa98dc05c` |
| 공식 이름 매핑 | [Mojang server mappings](https://piston-data.mojang.com/v1/objects/03f8985492bda0afc0898465341eb0acef35f570/server.txt) | SHA-1 `03f8985492bda0afc0898465341eb0acef35f570` |

다운로드한 JAR과 mappings의 SHA-1이 manifest의 값과 일치함을 확인했다. 서버 bundler 안의 `META-INF/versions/1.21.1/server-1.21.1.jar`에서 레시피·차원·인챈트·전리품 JSON과 필요한 클래스의 바이트코드를 읽었다. 클래스 파일의 major version은 65(Java 21)이다. `jawa 2.2.0`으로 `Code` attribute를 해독하고, 공식 mappings로 메서드·필드 이름을 대응시켰다.

이 작업은 **정적 JSON·바이트코드 대조와 별도의 상태·확률 계산**이다. Minecraft 서버를 실행하거나 게임 안에서 회로를 실시간 실험한 결과는 아니다. 원본 JAR, mappings, 추출한 바이트코드와 임시 분석 도구는 이 레포에 포함하지 않는다. 문항과 해설은 새로 작성했으며 게임 구현의 본문을 복제하지 않는다.

## 20문항별 대조와 검산

클래스·메서드명은 공식 Mojang mappings 기준이다. 아래 JSON 경로는 내부 JAR의 `data/minecraft/`를 기준으로 한다. 표의 정답 번호는 현재 원고의 선지 순서이다.

| 번호 | 실제 구현·데이터에서 확인한 규칙 | 독립 검산 결과 | 정답 |
| --- | --- | --- | ---: |
| 1 | `AbstractContainerMenu.getRedstoneSignalFromContainer`, `Mth.lerpDiscrete`: 슬롯별 최대 스택에 대한 평균 충전량으로 비교기 출력 계산 | `x+y=38`인 가능한 정수 수량을 열거. `(26,12)`만 출력 `(7,6)`을 만족 | ③ |
| 2 | 위 비교기 공식 및 `HopperBlockEntity.tryMoveItems`의 전원 잠금. 서로 다른 최대 스택은 각 슬롯의 충전량에 반영 | 최대 스택 64·16의 모든 대기 수량을 열거. 첫 출력 3의 직전은 `(41,10)`이며 가득 차도 출력 3 | ⑤ |
| 3 | `ComparatorBlock.calculateOutputSignal`: 양 옆 중 큰 신호와 비교하며 동률도 통과. 빼기는 0을 하한으로 사용 | `x+y=20`, `0≤x,y≤15` 전수 검사. `(13,7)`에서 A~D 출력은 `(6,7,7,7)` | ④ |
| 4 | `RepeaterBlock.getDelay`, `DiodeBlock.tick/checkTickOnNeighbor`: 설정값의 두 배 게임 틱 지연, 잠금 중 출력 유지, 해제 후 변경 예약 | 출력 구간 `[4,26)`, `[50,58)`의 길이 합은 30게임 틱 | ② |
| 5 | 같은 리피터 구현. 짧은 켜짐 입력은 지연 시점에 켜지고 최소 설정 지연만큼 유지 | 최종 출력 `[14,22)`, `[8,16)`의 합집합 길이는 14게임 틱 | ④ |
| 6 | `HopperBlockEntity.pushItemsTick/tryMoveItems`: 쿨다운 감소 후 전원 상태 검사, 성공 때 쿨다운 8 설정 | 틱별 감소·잠금·전송을 계산. 성공 시각 `0,8,16,24,43,51,68,79`, 총 8개 | ③ |
| 7 | `AbstractFurnaceBlockEntity.getFuel`: 석탄 1600틱·석탄 블록 16000틱. `recipe/coal_block.json`: 석탄 9개. `recipe/iron_ingot_from_smelting_raw_iron.json`: 200틱 | 석탄 수와 제작 블록 수를 열거. 23개 이하의 용량은 최대 200개. 24개로 `80·80·41`개 배분 가능 | ① |
| 8 | `CropBlock.getGrowthSpeed/randomTick`: 기본 점수 1, 수분 양수 토양 3·마른 토양 1, 주변은 1/4씩 가산, 동일 작물 감점은 한 번만, `floor(25/S)+1` 범위 판정 | 점수 `(5,9,31/8)`, 확률 `(1/6,1/3,1/7)`. 요구한 비는 `14/13` | ② |
| 9 | 같은 작물 생장 규칙. 밀의 최대 단계는 7이며 `isRandomlyTicking`은 성숙 상태에서 거짓 | 32개 성공·실패 열과 3×3 흡수 행렬을 각각 계산. 최종 벡터 `(50/243,95/243,98/243)` | ⑤ |
| 10 | `SugarCaneBlock.randomTick/updateShape/tick`: 위가 공기·높이 3 미만일 때만 age 변화. age 15의 **다음** 선택에서 성장·age 초기화. 지지 제거 후 위 블록도 제거 | 블록별 age·높이·수확 상태를 순서대로 갱신. 결과 `(수확 2, 높이 2, 최상단 age 15)` | ① |
| 11 | 일반·용광로·훈연기의 `getBurnDuration`, `recipe/iron_ingot_from_smelting_raw_iron.json`, `iron_ingot_from_blasting_raw_iron.json`, `dried_kelp_from_smoking.json`, `glass.json`. 빠른 두 장치는 처리·연소 시간이 모두 절반 | 99개 정수 배분을 검사. 석탄 `3·8·8`개와 품목 `24·64·64`개로 최소 6400틱 | ④ |
| 12 | 훈연기 연소 시간과 켈프 처리 100틱. `recipe/dried_kelp_block.json`: 9개로 블록 제작. `recipe/dried_kelp.json`: 미점화 블록을 9개로 역제작 가능 | 시간·보유량·연료 선택을 재귀 열거. 9600틱에 60개를 확보한 뒤 멈춤. 5번째 블록을 점화하면 기한 내 55개 | ③ |
| 13 | 작물 생장 점수·대각선 감점. `FarmBlock.randomTick`: 비를 맞는 수분 7 토양은 수분 7 유지 | 확장된 10×10격자의 실제 이웃을 확인하고 내부 8×8만 합산. 기대값 `(176/9,160/9,88/9)` | ⑤ |
| 14 | `PotionBrewing.addVanillaMixes`의 재료 경로, `BrewingStandBlockEntity.serverTick`의 3병 처리·회당 연료 소모·가루당 연료 20 | 공통 어색한 물약 18병을 함께 처리. 최소 `6+8+6+4=24`회, 연료 가루 2개 | ① |
| 15 | `recipe/{rail,powered_rail,hopper,hopper_minecart,minecart,chest,stick}.json`의 재료와 제작 묶음 수량 | 모듈 수별 최소 소비량 열거. 5개는 `(철111,금12,판자84,레드스톤2)`로 가능. 6개는 철132·판자102로 불가능 | ② |
| 16 | `Player.getXpNeededForNextLevel/onEnchantmentPerformed`: 구간별 다음 레벨 필요 포인트와 실제 소비 레벨 | 계획 A 807포인트, B 612포인트. 차 195포인트이며 둘 다 최종 레벨 27 | ④ |
| 17 | `enchantment/unbreaking.json`: 비방어구 도구의 `item_damage/remove_binomial`, 내구성 III의 무시 확률 3/4 | 생존 사건 `189/256`, 정확히 여섯 번째 파손 사건 `405/4096`을 유리수로 계산. 조건부 확률 `15/112` | ⑤ |
| 18 | `loot_table/blocks/diamond_ore.json`, `ApplyBonusCount$OreDrops.calculateNewCount`: 행운 III에서 기본 1개에 배율 `(1,1,2,3,4)` | 순서 있는 드롭 조합 64개를 비균등 확률로 열거. 분모 사건 `18/125`, 분자 사건 `15/125`, 결과 `5/6` | ① |
| 19 | `dimension_type/{overworld,the_nether}.json`의 좌표 배율 1·8. `SectionPos.blockToSectionCoord`의 산술 shift 4와 `ChunkPos`의 청크 경계 | 입력 136×136점을 전수 투영. 목표 블록 324개, 청크 4개. 음수도 아래쪽 정수로 내림 | ② |
| 20 | `NaturalSpawner.isRightDistanceToPlayerAndSpawnPoint/isValidSpawnPostitionForType`: 거리 제곱 576 이하 제외, 일반 MONSTER의 거리 상한 128. `MobCategory`, 오버월드 블록광 제한 0 | 중앙·모서리 거리와 정수 높이 전수 검사. 허용 높이 89~183, 총 95개 | ③ |

정답 배열은 `(3,5,4,2,4,3,1,2,5,1,4,3,5,1,2,4,5,1,2,3)`이다. 분수 계산은 가능한 곳에서 정확한 유리수로 수행했고, 배치·시간·재료·좌표는 유한 상태 또는 정수 범위를 열거하여 유일한 선지와 대조했다.

## 문제에서 정한 전제

- 게임 틱과 레드스톤 틱을 구분한다. 레드스톤 1틱은 게임 2틱이다. 잠금·입력 로그, 초기 출력, 예약된 변화, 호퍼 처리보다 먼저 확정하는 전원 상태 등은 자료에 지정한 순서를 따른다.
- 비교기 문항은 안정 상태의 신호 강도를 다룬다. 배선의 신호 손실과 되먹임은 자료의 조건대로 처리한다. 펄스 합류는 신호의 합집합이며 레드스톤 램프의 별도 소등 지연을 추가하지 않는다.
- 제련 문항은 지정한 연료·레시피·장치만 사용한다. 공급·수거 대기가 없다는 것은 문제의 처리 조건이다. 점화한 연료의 잔여 연소 시간을 다른 장치에 옮기지 않는다. 미점화 켈프 블록의 역제작은 실제 레시피대로 허용한다.
- 확률 문항의 독립성은 명시한 이산 확률 모형의 전제이다. 실제 의사난수 시드나 난수열을 재현한 검증은 아니다. 밀의 관찰 횟수는 **위치가 무작위 틱 후보로 선택된 횟수**이다. 성숙 후에는 생장 판정을 실행하지 않으므로 행렬에서는 성숙 상태를 흡수 상태로 둔다.
- 제작 모듈의 구성, 자원 보유량, 중간 생성물의 공동 처리, 경험치 진행률 0 등은 출제 조건이다. 자료가 제외한 대체 획득·제작 경로를 계산에 추가하지 않는다.
- 네더 문항의 내림 목표는 명시한 좌표 집합 계산이다. 실제 포털의 탐색·생성·연결 결과를 보장하지 않는다. 좀비 문항은 다른 생성 조건을 모두 충족시킨 **거리 검사**이며 생성 횟수·생성 보장을 뜻하지 않는다.

## 비트맵 삽화

[제련 장치](assets/minecraft/automatic-smelter.png)와 [양조기](assets/minecraft/brewing-batch.png)는 `image_gen`으로 생성한 1536×1024 PNG이다. [생성 프롬프트](assets/minecraft/PROMPTS.md)를 함께 보관한다. 게임 화면을 캡처한 것이 아니라 장치의 외형을 보여 주는 창작 삽화이며, Typst에서 종횡비를 유지해 배치한다.

이미지의 임의 픽셀·방향·장식은 실제 배선의 연결, 처리량, 타이밍을 판정하는 자료로 사용하지 않는다. 문항 7은 제련 모듈 한 대의 외형을 보여 주고 장치 세 대·수량·연료 조건은 본문에 정한다. 문항 14의 목표 물약·병 수·분기·재료 순서는 표에 정한다. 답을 결정하는 규칙은 네이티브 텍스트·표·수식에 있다.

공식 설명의 보조 대조에는 [Java 1.21.1 릴리스](https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-1), [Hopper](https://www.minecraft.net/en-us/article/hopper), [Blast Furnace](https://www.minecraft.net/en-us/article/block-week--blast-furnace), [Smoker](https://www.minecraft.net/nl-nl/article/block-week--smoker), [Brewing Stand](https://www.minecraft.net/en-us/article/taking-inventory--brewing-stand), [Blaze Powder](https://www.minecraft.net/en-us/article/taking-inventory--blaze-powder), [Rails](https://www.minecraft.net/en-us/article/taking-inventory--rails)을 사용했다. 버전별 규칙의 기준은 위에 고정한 공식 배포본이다.
