build:
	docker build -t voice_gpt_bot .

run:
	docker run -d -p 3000:3000 --name voice_gpt_bot --rm voice_gpt_bot