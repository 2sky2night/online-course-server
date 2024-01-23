import { registerAs } from "@nestjs/config";

/**
 * 支付宝第三方登录配置信息
 */
export const alipayConfig = registerAs("alipay", () => {
  return {
    app_id: "2021004132674105",
    private_key:
      "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5B1q1X2ieGjOays6YSC0OWzLE3pkKUgXK5FbsLV9VPz2/uCGpWzVUoZTz+SS7T+HxFwvIbQvU5ynuZ/6it6GNeUp3/vlhb3h6ukJgAIDJpaFvXmQ/02z8xlTv8pFAkmLVqkqUJvmxBmEvvdZizXV8+J6Z/w1QO4o0EnnuaZ2frkGtvJpMCZICq2pYQU4apADiOlGVmV/z1O7BgtqxIDHNKAYCS2M+JgeFc1L8Dr+6dqAep21O4UWBmEKGIvwrZ3bUhZqGle+ZSurAaSnimjQC9WM+Q/q/xqopSFeRJNd9YD5P2GhCd1xncWKwD41qqpf0dq8BsxjDLozkKjjlx017AgMBAAECggEAUFg7MUruuMiT5AFw2Htu5S8AyrAGMI8RaNriS8gf/3poq9me9FVgwRExBwgGxTeY2wGw4iVH3/lJIfcSgUHP6wjiJ10WmRK4dEJxFBLj2awMf7mzOmvqhZDxzQe9vxZRyIobvF14S0CD7yE1+M1S2SN0a1ZvR4mzJ41mWPqPsYhQK1pq90dpuWWXdlt64J0QbBITLlXCUkLS+9sJ+99YecIcL5r8p6QWER7uVJ4jHAvyJ/4aSsL1stv82WZbR44xwX9ILQ+k+Xlj8vjwuB2+3svp5DCwse/JxiLAaPmQ7xCpKYw/+Qg2v2kINt1Va4fqx/pf5MpLkuBiAvVJ0/3NAQKBgQD+x+JSqeWtQPZ7WQeKzshVTFU0GEQ5Bb2M6R9wWmlRz4itq7vvjguVPP4drsQJ4gZx25nRihQy213U6HiIGaMtahQKyLmHgpv3Ifnx6EVu9F81KFPTwx90QTv1ZOKwsvenBRLVnmoZeJ0Ahu38ErXVk4A898G1SiDztqGofoZrQQKBgQC56gV5b7TzDXTyxo/ppzgVOJGo4iqGRDS7pwBtkakJUzhqp+zOnGViIkVkVefQXPi3P8tcigMGZhd0miDwVkPMV5jkyLYe2nsWaTnODYYX5xIG3QtB5X5tNnfgmeFgYCMIueRg4gxvkrKQHJhc0Z69Tl38vgR0yb6746YiiUK1uwKBgDqf88vhnB/Jmu23Bq1B94bpEZHzI3+beoo5+in4I9PXVTPhGFV+8dtdNXvPAvzjLWh1h2dXxl4NbAHZnCJ1A78ncYUpuscbnpe3EbRAJfnp8R5iMSfA9jPh7tIAbMkL5UBhQnw0/2TtA/NjGM+v3ndOgWuF9uSoMfziQUBsHLIBAoGAYZAFv2x3sPTm4mCBNUSjkb9V8SJ+3mb8pV1GRDmkU1hwysfE5cf9DDqf37+VHysq+j9oIO/sFneM54varUUX3yw4+Ba8PAS7g09FHnTKYdDJDQEC31nntrhWwG8AbusEd5fV2WHG1OZO/oGDE3KNsxplCDVPcVpN1Zvpm0Yc0/ECgYEAi5TxkC0HWX0Eu+etk/7zPxCK11evF/P1mVHqSla3B1dOSA/7/Zzc55fazp/BnUo1V+zRtF/l478as4R1vcv5Ad4hBTcy4WabIKpn89I4iAiI/OEM85rxHqemJ8SJkHOMSCrGmnTxfludWnXgs2O07favxA8GpdUeQP2p+8SIQ/0=",
    alipay_public_key:
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuQdatV9onhozmsrOmEgtDlsyxN6ZClIFyuRW7C1fVT89v7ghqVs1VKGU8/kku0/h8RcLyG0L1Ocp7mf+orehjXlKd/75YW94erpCYACAyaWhb15kP9Ns/MZU7/KRQJJi1apKlCb5sQZhL73WYs11fPiemf8NUDuKNBJ57mmdn65BrbyaTAmSAqtqWEFOGqQA4jpRlZlf89TuwYLasSAxzSgGAktjPiYHhXNS/A6/unagHqdtTuFFgZhChiL8K2d21IWahpXvmUrqwGkp4po0AvVjPkP6v8aqKUhXkSTXfWA+T9hoQndcZ3FisA+NaqqX9HavAbMYwy6M5Co45cdNewIDAQAB",
  };
});
