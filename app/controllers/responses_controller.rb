class ResponsesController < ApplicationController
  def create
    puts "PARAMS: #{params.inspect}"

    @survey = Survey.find(params[:survey_id])

    submission = @survey.submissions.create!(role: params.dig(:response, :submission, :role))

    responses = params.dig(:response, :question_responses_attributes) || []

    responses.each do |response_data|
      Response.create!(
        survey: @survey,
        submission: submission,
        question_id: response_data[:question_id],
        value: response_data[:content] # assumes you're sending `content`
      )
    end

    respond_to do |format|
      format.html { redirect_to surveys_path, notice: 'Responses were successfully recorded.' }
      format.json { render json: { success: true }, status: :created }
    end
  rescue => e
    Rails.logger.error("Response creation failed: #{e.message}")
    respond_to do |format|
      format.html { redirect_to take_survey_path(@survey), alert: 'There was an error recording your response.' }
      format.json { render json: { error: e.message }, status: :unprocessable_entity }
    end
  end
end
