# FALHAS

| data | o que quebrou | menor correção | prompt \| infra |
|---|---|---|---|
| 2026-11-14 | shader da fruta não compilava (`projectionMatrix` não existe no fragment do ShaderMaterial) | declarar `uniform mat4 projectionMatrix;` no fragment | prompt |
| 2026-11-14 | cores do objeto lavadas (sRGB tratado como linear) | `Color().setRGB(..., SRGBColorSpace)` | prompt |
