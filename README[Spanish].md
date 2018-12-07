# gaia_bot_monitor

Un Bot que monitorea la cadena de Gaia cuando algo le sucede a un validador específico, y envía alertas a través de Telegram.
Envía una alerta cada 15 segundos, si ocurre algo durante ese tiempo.

Puede encontrar este bot en Telegram por: @ForboleGaiaBot
Comandos disponibles:

`/start` - Dice Hola !!!

`/help` - Link a este repositorio en github

`/subscribe` - Suscribe un validador por su hexcosmosvaladdr</br>
Uso: `/unsubscribe [hexcosmosvaladdr...]`

`/mute` - Silencia a un validador con un tipo específico</br>
Uso: `/mute [hexcosmosvaladdr...] [absent|slashed|revoked]`

`/unmute` - Desactiva el silencio a un validador con un tipo específico</br>
Uso: `/unmute [hexcosmosvaladdr...] [absent|slashed|revoked]`

#### Obsoleto:
`/hack` - Convierte una cosmosvaladdr a hex</br>
Uso: `/hack [cosmosvaladdr...]`
