build:
	docker build -t VoiceGPTBot .

run:
	docker run -d -p 3000:3000 --name VoiceGPTBot --rm VoiceGPTBot